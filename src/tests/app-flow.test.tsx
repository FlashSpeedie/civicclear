import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { DocumentAnalysis, SourceBlock } from '@/types';

// next/navigation is used by LandingView via useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

// pdfjs-dist touches browser/worker globals; the paste flow under test does not need it
vi.mock('@/lib/documents/pdf-extraction', () => ({
  splitTextIntoBlocks: (text: string): SourceBlock[] =>
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((paragraph, i) => ({ id: `para-${i + 1}`, label: `Paragraph ${i + 1}`, page: null, text: paragraph })),
  combineBlocksText: (blocks: Array<{ text: string }>) => blocks.map((b) => b.text).join('\n\n'),
  extractTextFromPDF: vi.fn(),
}));

import Home from '@/app/page';

function minimalAnalysis(): DocumentAnalysis {
  return {
    documentTitle: 'Northbridge Community Scholarship Notice',
    documentType: 'Scholarship award notice',
    oneSentenceSummary: 'You must accept the scholarship and submit documents by the stated deadlines.',
    plainEnglishSummary: 'A plain-English explanation of the document.',
    whyItMatters: 'Missing a requirement can delay or cancel the award.',
    immediateActions: [
      {
        id: 'action-1',
        text: 'Accept the award through the portal',
        evidence: [{ blockId: 'para-1', quote: 'Submit the scholarship acceptance form' }],
        evidenceStatus: [],
        priority: 'high',
        details: 'Use the Student Awards Portal.',
        dependsOn: [],
        dueDateId: null,
      },
    ],
    checklist: [],
    dates: [],
    requiredItems: [],
    terms: [],
    questionsToAsk: [],
    uncertainties: [],
    messageDraft: null,
  };
}

const DOCUMENT_TEXT =
  'Recipients must respond within 14 calendar days after the date of this notice.\n\nThe checklist deadline is October 20, 2026.';

describe('App end-to-end flow', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('walks paste → review → privacy → context → analyze → results', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ analysis: minimalAnalysis() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<Home />);

    // Landing
    fireEvent.click(screen.getByRole('button', { name: /start with a document/i }));

    // Input step: paste text
    const textarea = await screen.findByLabelText(/paste your document text here/i);
    fireEvent.change(textarea, { target: { value: DOCUMENT_TEXT } });
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    // Review step
    expect(await screen.findByText(/review extracted text/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    // Privacy step: the confirm button is always clickable, with a hint until consent is given
    expect(await screen.findByText(/privacy checkpoint/i)).toBeInTheDocument();
    expect(screen.getByText(/check the confirmation box/i)).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /make this understandable/i });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.click(confirmButton);

    // Context step appears
    expect(await screen.findByText(/what are you trying to figure out/i)).toBeInTheDocument();

    // Analyze
    fireEvent.click(screen.getByRole('button', { name: /analyze document/i }));

    // Results
    expect(await screen.findByText(/the gist/i)).toBeInTheDocument();
    expect(screen.getByText('Northbridge Community Scholarship Notice')).toBeInTheDocument();

    // The fetch payload carried the reviewed source blocks
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, init] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.sourceBlocks).toHaveLength(2);
    expect(body.sourceBlocks[0].text).toContain('14 calendar days');
  });

  it('requires consent and shows feedback when the button is clicked without it', async () => {
    global.fetch = vi.fn();
    render(<Home />);

    fireEvent.click(screen.getByRole('button', { name: /start with a document/i }));
    const textarea = await screen.findByLabelText(/paste your document text here/i);
    fireEvent.change(textarea, { target: { value: DOCUMENT_TEXT } });
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(await screen.findByText(/privacy checkpoint/i)).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /make this understandable/i });

    // A hint is visible before consent
    expect(screen.getByText(/check the confirmation box/i)).toBeInTheDocument();

    // Clicking without consent shows an explicit error and does not advance
    fireEvent.click(confirmButton);
    expect(await screen.findByText(/please confirm the checkbox above before continuing/i)).toBeInTheDocument();
    expect(screen.queryByText(/what are you trying to figure out/i)).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    // Checking the box clears the error and the click advances
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.queryByText(/please confirm the checkbox above/i)).not.toBeInTheDocument();
    fireEvent.click(confirmButton);
    expect(await screen.findByText(/what are you trying to figure out/i)).toBeInTheDocument();
  });

  it('shows the server error on the context step when analysis fails', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'The AI service is temporarily unavailable. Please try again.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /start with a document/i }));
    const textarea = await screen.findByLabelText(/paste your document text here/i);
    fireEvent.change(textarea, { target: { value: DOCUMENT_TEXT } });
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));
    await screen.findByText(/privacy checkpoint/i);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /make this understandable/i }));
    await screen.findByText(/what are you trying to figure out/i);
    fireEvent.click(screen.getByRole('button', { name: /analyze document/i }));

    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    // Back on the context step so the user can retry
    expect(screen.getByText(/what are you trying to figure out/i)).toBeInTheDocument();
  });

  it('does not send a request when pasted text is empty', async () => {
    global.fetch = vi.fn();
    render(<Home />);

    fireEvent.click(screen.getByRole('button', { name: /start with a document/i }));
    const continueButton = await screen.findByRole('button', { name: /^continue$/i });

    expect(continueButton).toBeDisabled();
  });
});
