import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the gemini module
vi.mock('@/lib/ai/gemini', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai/gemini')>('@/lib/ai/gemini');
  return {
    ...actual,
    analyzeWithGemini: vi.fn(),
    isGeminiConfigured: vi.fn(),
  };
});

import { POST } from '@/app/api/analyze/route';
import { analyzeWithGemini, isGeminiConfigured, GeminiProviderError } from '@/lib/ai/gemini';

const mockAnalysis = {
  documentTitle: 'Test',
  documentType: 'Test type',
  oneSentenceSummary: 'Summary',
  plainEnglishSummary: 'Plain summary',
  whyItMatters: 'Matters',
  immediateActions: [],
  checklist: [],
  dates: [],
  requiredItems: [],
  terms: [],
  questionsToAsk: [],
  uncertainties: [],
  messageDraft: null,
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validRequestBody = {
  sourceBlocks: [
    { id: 'page-1', label: 'Page 1', page: 1, text: 'Test document content.' },
  ],
  userContext: 'Test context',
  userRole: 'student',
  referenceDate: '2024-01-15',
};

describe('Analysis API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isGeminiConfigured).mockReturnValue(true);
  });

  it('returns 503 when Gemini is not configured', async () => {
    vi.mocked(isGeminiConfigured).mockReturnValue(false);

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('GEMINI_API_KEY');
    expect(data.error).toContain('sample walkthrough');
    expect(analyzeWithGemini).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid request body', async () => {
    const response = await POST(makeRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('returns 400 for unparseable JSON body', async () => {
    const request = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: 'not json{{{',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 413 for oversized request', async () => {
    const largeBlocks = Array(50).fill(null).map((_, i) => ({
      id: `page-${i}`,
      label: `Page ${i}`,
      page: i,
      text: 'x'.repeat(3000), // Total > 100000
    }));

    const response = await POST(makeRequest({ sourceBlocks: largeBlocks }));
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.error).toContain('character limit');
  });

  it('returns analysis on success with verified evidence', async () => {
    const analysisWithQuote = {
      ...mockAnalysis,
      immediateActions: [
        {
          id: 'action-1',
          text: 'Do the thing',
          evidence: [{ blockId: 'page-1', quote: 'Test document content.' }],
          priority: 'high' as const,
          details: 'Details',
          dependsOn: [],
          dueDateId: null,
        },
      ],
    };
    vi.mocked(analyzeWithGemini).mockResolvedValue(analysisWithQuote);

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis.documentTitle).toBe('Test');
    expect(data.analysis.immediateActions[0].evidenceStatus[0].verified).toBe(true);
    expect(data.analysis.immediateActions[0].evidenceStatus[0].sourceLabel).toBe('Page 1');
    expect(data.analysis.immediateActions[0].evidenceStatus[0].page).toBe(1);
  });

  it('marks fabricated evidence as unverified', async () => {
    const analysisWithFakeQuote = {
      ...mockAnalysis,
      checklist: [
        {
          id: 'task-1',
          text: 'Claim not in the document',
          evidence: [{ blockId: 'page-1', quote: 'this exact phrase never appears in the source' }],
          priority: 'high' as const,
          details: '',
          dependsOn: [],
          dueDateId: null,
        },
      ],
    };
    vi.mocked(analyzeWithGemini).mockResolvedValue(analysisWithFakeQuote);

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis.checklist[0].evidenceStatus[0].verified).toBe(false);
  });

  it('marks evidence with a nonexistent block as unverified', async () => {
    const analysisWithBadBlock = {
      ...mockAnalysis,
      checklist: [
        {
          id: 'task-1',
          text: 'Claim citing missing block',
          evidence: [{ blockId: 'page-99', quote: 'Test document content.' }],
          priority: 'high' as const,
          details: '',
          dependsOn: [],
          dueDateId: null,
        },
      ],
    };
    vi.mocked(analyzeWithGemini).mockResolvedValue(analysisWithBadBlock);

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis.checklist[0].evidenceStatus[0].verified).toBe(false);
  });

  it('rejects model output that fails schema validation', async () => {
    vi.mocked(analyzeWithGemini).mockResolvedValue({
      not: 'a valid analysis',
    } as never);

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Analysis failed');
  });

  it('maps invalid API key errors to a safe 502 message', async () => {
    vi.mocked(analyzeWithGemini).mockRejectedValue(
      new GeminiProviderError('invalid_api_key', 'internal detail: api key abc123 leaked', ['gemini-3.1-pro-preview'])
    );

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('Gemini API key');
    expect(data.error).not.toContain('abc123');
  });

  it('maps permission errors to a safe 502 message', async () => {
    vi.mocked(analyzeWithGemini).mockRejectedValue(
      new GeminiProviderError('permission_denied', 'forbidden', ['gemini-3.1-pro-preview'])
    );

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('access');
  });

  it('maps exhausted rate limits to 429 across all models', async () => {
    vi.mocked(analyzeWithGemini).mockRejectedValue(
      new GeminiProviderError('rate_limited', 'quota exceeded', [
        'gemini-3.1-pro-preview',
        'gemini-3.8-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ])
    );

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('rate limited');
    expect(data.error).not.toContain('quota exceeded');
  });

  it('maps network failures to 504', async () => {
    vi.mocked(analyzeWithGemini).mockRejectedValue(
      new GeminiProviderError('network', 'socket hang up', ['gemini-3.1-pro-preview'])
    );

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(504);
    expect(data.error).toContain('timed out');
  });

  it('maps parse failures to a safe 502 message', async () => {
    vi.mocked(analyzeWithGemini).mockRejectedValue(
      new GeminiProviderError('parse_error', 'bad json', ['gemini-3.1-pro-preview'])
    );

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('invalid response');
  });

  it('handles unexpected errors without leaking details', async () => {
    vi.mocked(analyzeWithGemini).mockRejectedValue(new Error('secret stack details'));

    const response = await POST(makeRequest(validRequestBody));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Analysis failed. Please try again.');
    expect(data.error).not.toContain('secret stack details');
  });
});
