import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeWithGemini, isGeminiConfigured, GeminiProviderError } from '@/lib/ai/gemini';
import { validateAnalysis } from '@/lib/analysis/schema';
import { verifyEvidence } from '@/lib/analysis/validate-evidence';
import { SourceBlock } from '@/types';

const MAX_BLOCKS = 100;
const MAX_TOTAL_CHARS = 100000;

const AnalysisRequestSchema = z.object({
  sourceBlocks: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    page: z.number().nullable(),
    text: z.string(),
  })).min(1).max(MAX_BLOCKS),
  userContext: z.string().optional(),
  userRole: z.string().optional(),
  referenceDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI analysis is not configured yet. Add your Gemini API key to the server environment (GEMINI_API_KEY) to enable document analysis. You can still explore the sample walkthrough.' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const validation = AnalysisRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { sourceBlocks, userContext, userRole, referenceDate } = validation.data;

    const totalChars = sourceBlocks.reduce((sum, b) => sum + b.text.length, 0);
    if (totalChars === 0) {
      return NextResponse.json(
        { error: 'Document text is empty.' },
        { status: 400 }
      );
    }
    if (totalChars > MAX_TOTAL_CHARS) {
      return NextResponse.json(
        { error: `Total text exceeds ${MAX_TOTAL_CHARS} character limit` },
        { status: 413 }
      );
    }

    const analysis = await analyzeWithGemini(sourceBlocks, userContext || '', userRole || '', referenceDate || '');

    const validatedAnalysis = validateAnalysis(analysis);

    const attachStatus = <T extends { evidence: { blockId: string; quote: string }[] }>(finding: T) => ({
      ...finding,
      evidenceStatus: verifyEvidence(finding.evidence, sourceBlocks as SourceBlock[]),
    });

    const response = {
      ...validatedAnalysis,
      immediateActions: validatedAnalysis.immediateActions.map(attachStatus),
      checklist: validatedAnalysis.checklist.map(attachStatus),
      dates: validatedAnalysis.dates.map(attachStatus),
      requiredItems: validatedAnalysis.requiredItems.map(attachStatus),
      uncertainties: validatedAnalysis.uncertainties.map(attachStatus),
    };

    return NextResponse.json({ analysis: response });
  } catch (error: unknown) {
    if (error instanceof GeminiProviderError) {
      console.warn(`[analyze] GeminiProviderError kind=${error.kind} attempted=${error.attemptedModels.join(',') || 'none'}`);
      return NextResponse.json(
        { error: userFacingMessageFor(error) },
        { status: statusFor(error) }
      );
    }

    const message = error instanceof Error ? error.message : 'unknown';
    console.error(`[analyze] unexpected error: ${message}`);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}

function statusFor(error: GeminiProviderError): number {
  switch (error.kind) {
    case 'not_configured':
      return 503;
    case 'rate_limited':
      return 429;
    case 'network':
      return 504;
    default:
      return 502;
  }
}

function userFacingMessageFor(error: GeminiProviderError): string {
  switch (error.kind) {
    case 'not_configured':
      return 'AI analysis is not configured yet. Add your Gemini API key to the server environment (GEMINI_API_KEY) to enable document analysis. You can still explore the sample walkthrough.';
    case 'invalid_api_key':
      return 'Invalid API credentials. Check your Gemini API key in the server environment.';
    case 'permission_denied':
      return 'The configured Gemini API key does not have access to the available models. Check your key and account access.';
    case 'invalid_request':
      return 'The document could not be processed by the AI service. Try shortening or simplifying the text.';
    case 'rate_limited':
      return 'The AI service is rate limited right now. Please wait a moment and try again.';
    case 'model_unavailable':
      return 'None of the configured Gemini models are currently available for this account. Please try again later or check your model access.';
    case 'server_error':
      return 'The AI service is temporarily unavailable. Please try again.';
    case 'network':
      return 'The request to the AI service timed out. Please try again.';
    case 'empty_response':
    case 'parse_error':
      return 'The AI service returned an invalid response. Please try again.';
    default:
      return 'Analysis failed. Please try again.';
  }
}
