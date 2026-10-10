import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { DocumentAnalysis } from '@/types';

const generateContentMock = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = { generateContent: generateContentMock };
  },
}));

import {
  analyzeWithGemini,
  isGeminiConfigured,
  GeminiProviderError,
  GEMINI_MODEL_PRIORITY,
} from '@/lib/ai/gemini';

const sourceBlocks = [
  {
    id: 'page-1',
    label: 'Page 1',
    page: 1,
    text: 'The application deadline is March 15, 2025. Submit the signed form.',
  },
];

function minimalAnalysis(): DocumentAnalysis {
  return {
    documentTitle: 'Letter',
    documentType: 'School form',
    oneSentenceSummary: 'Submit the signed form by March 15, 2025.',
    plainEnglishSummary: 'This letter asks you to submit a signed form.',
    whyItMatters: 'Missing the deadline may delay processing.',
    immediateActions: [],
    checklist: [],
    dates: [],
    requiredItems: [],
    terms: [],
    questionsToAsk: [],
    uncertainties: [],
    messageDraft: null,
  };
}

function apiError(status: number, message: string): Error & { status: number } {
  const err = new Error(message);
  (err as { status?: number }).status = status;
  return err as Error & { status: number };
}

describe('gemini provider', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    generateContentMock.mockReset();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  describe('isGeminiConfigured', () => {
    it('returns false when GEMINI_API_KEY is missing', () => {
      delete process.env.GEMINI_API_KEY;
      expect(isGeminiConfigured()).toBe(false);
    });

    it('returns true when GEMINI_API_KEY is set', () => {
      expect(isGeminiConfigured()).toBe(true);
    });
  });

  it('throws not_configured without calling the API when the key is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(
      analyzeWithGemini(sourceBlocks, '', '', '')
    ).rejects.toMatchObject({ kind: 'not_configured' });

    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it('returns parsed analysis from the first model on success', async () => {
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(minimalAnalysis()) });

    const result = await analyzeWithGemini(sourceBlocks, 'check the deadline', 'student', '');

    expect(result.documentTitle).toBe('Letter');
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock.mock.calls[0][0].model).toBe(GEMINI_MODEL_PRIORITY[0]);
  });

  it('requests JSON output with the document schema and a timeout', async () => {
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(minimalAnalysis()) });

    await analyzeWithGemini(sourceBlocks, '', '', '2025-03-01');

    const call = generateContentMock.mock.calls[0][0];
    expect(call.config.responseMimeType).toBe('application/json');
    expect(call.config.responseJsonSchema).toBeDefined();
    expect(call.config.abortSignal).toBeInstanceOf(AbortSignal);
  });

  it('falls back to the next model when the first model is unavailable (404)', async () => {
    generateContentMock
      .mockRejectedValueOnce(apiError(404, 'model not found'))
      .mockResolvedValueOnce({ text: JSON.stringify(minimalAnalysis()) });

    const result = await analyzeWithGemini(sourceBlocks, '', '', '');

    expect(result.documentType).toBe('School form');
    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(generateContentMock.mock.calls[0][0].model).toBe(GEMINI_MODEL_PRIORITY[0]);
    expect(generateContentMock.mock.calls[1][0].model).toBe(GEMINI_MODEL_PRIORITY[1]);
  });

  it('falls back through multiple models on retryable failures', async () => {
    generateContentMock
      .mockRejectedValueOnce(apiError(404, 'model not found'))
      .mockRejectedValueOnce(apiError(429, 'resource exhausted'))
      .mockRejectedValueOnce(apiError(503, 'service unavailable'))
      .mockResolvedValueOnce({ text: JSON.stringify(minimalAnalysis()) });

    const result = await analyzeWithGemini(sourceBlocks, '', '', '');

    expect(generateContentMock).toHaveBeenCalledTimes(4);
    expect(generateContentMock.mock.calls[3][0].model).toBe(GEMINI_MODEL_PRIORITY[3]);
    expect(result.documentTitle).toBe('Letter');
  });

  it('treats empty responses as model-specific failures and falls back', async () => {
    generateContentMock
      .mockResolvedValueOnce({ text: '' })
      .mockResolvedValueOnce({ text: JSON.stringify(minimalAnalysis()) });

    const result = await analyzeWithGemini(sourceBlocks, '', '', '');

    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(result.documentType).toBe('School form');
  });

  it('treats malformed JSON as a model failure and falls back', async () => {
    generateContentMock
      .mockResolvedValueOnce({ text: 'not json at all' })
      .mockResolvedValueOnce({ text: JSON.stringify(minimalAnalysis()) });

    const result = await analyzeWithGemini(sourceBlocks, '', '', '');

    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(result.documentTitle).toBe('Letter');
  });

  it('strips markdown code fences before parsing', async () => {
    generateContentMock.mockResolvedValueOnce({
      text: '```json\n' + JSON.stringify(minimalAnalysis()) + '\n```',
    });

    const result = await analyzeWithGemini(sourceBlocks, '', '', '');
    expect(result.documentTitle).toBe('Letter');
  });

  it('stops immediately on invalid API key without trying later models', async () => {
    generateContentMock.mockRejectedValueOnce(apiError(401, 'API key not valid'));

    await expect(
      analyzeWithGemini(sourceBlocks, '', '', '')
    ).rejects.toMatchObject({ kind: 'invalid_api_key' });

    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it('stops immediately on permission errors without trying later models', async () => {
    generateContentMock.mockRejectedValueOnce(apiError(403, 'permission denied'));

    await expect(
      analyzeWithGemini(sourceBlocks, '', '', '')
    ).rejects.toMatchObject({ kind: 'permission_denied' });

    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it('stops immediately on invalid request errors', async () => {
    generateContentMock.mockRejectedValueOnce(apiError(400, 'invalid argument'));

    await expect(
      analyzeWithGemini(sourceBlocks, '', '', '')
    ).rejects.toMatchObject({ kind: 'invalid_request' });

    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it('fails after exhausting all models, reporting which were attempted', async () => {
    generateContentMock.mockRejectedValue(apiError(429, 'resource exhausted'));

    const promise = analyzeWithGemini(sourceBlocks, '', '', '');

    await expect(promise).rejects.toMatchObject({
      kind: 'rate_limited',
      attemptedModels: [...GEMINI_MODEL_PRIORITY],
    });
    expect(generateContentMock).toHaveBeenCalledTimes(GEMINI_MODEL_PRIORITY.length);
  });

  it('attempts each model at most once', async () => {
    generateContentMock.mockRejectedValue(apiError(500, 'internal error'));

    await expect(analyzeWithGemini(sourceBlocks, '', '', '')).rejects.toBeInstanceOf(GeminiProviderError);

    const models = generateContentMock.mock.calls.map((c) => c[0].model);
    expect(new Set(models).size).toBe(models.length);
    expect(models).toEqual([...GEMINI_MODEL_PRIORITY]);
  });

  it('never includes document text or API key in thrown errors', async () => {
    process.env.GEMINI_API_KEY = 'super-secret-key-value';
    generateContentMock.mockRejectedValue(apiError(500, 'internal error'));

    const error = await analyzeWithGemini(sourceBlocks, '', '', '').catch((e) => e);

    expect(error).toBeInstanceOf(GeminiProviderError);
    expect(error.message).not.toContain('March 15, 2025');
    expect(error.message).not.toContain('super-secret-key-value');
  });
});
