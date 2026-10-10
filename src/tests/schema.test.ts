import { describe, it, expect } from 'vitest';
import { DocumentAnalysisSchema, validateAnalysis, safeValidateAnalysis } from '@/lib/analysis/schema';
import { DocumentAnalysis, ActionItem, RequiredItem, DocumentDate } from '@/types';

const validAnalysis: DocumentAnalysis = {
  documentTitle: 'Test Document',
  documentType: 'Test type',
  oneSentenceSummary: 'A test summary.',
  plainEnglishSummary: 'A plain English summary of the test document.',
  whyItMatters: 'This matters because it is a test.',
  immediateActions: [
    {
      id: 'action-1',
      text: 'Do something',
      evidence: [{ blockId: 'page-1', quote: 'Do something now' }],
      evidenceStatus: [{ verified: true, sourceLabel: 'Page 1', page: 1 }],
      priority: 'high',
      details: 'Details here',
      dependsOn: [],
      dueDateId: 'date-1',
    },
  ],
  checklist: [
    {
      id: 'task-1',
      text: 'Complete task',
      evidence: [{ blockId: 'page-1', quote: 'Complete the task' }],
      evidenceStatus: [{ verified: true, sourceLabel: 'Page 1', page: 1 }],
      priority: 'high',
      details: 'Task details',
      dependsOn: [],
      dueDateId: 'date-1',
    },
  ],
  dates: [
    {
      id: 'date-1',
      label: 'Deadline',
      originalPhrase: 'March 15, 2024',
      normalizedDate: '2024-03-15',
      dateType: 'deadline',
      needsConfirmation: false,
      explanation: 'Application deadline',
      evidence: [{ blockId: 'page-1', quote: 'March 15, 2024' }],
      evidenceStatus: [{ verified: true, sourceLabel: 'Page 1', page: 1 }],
      text: 'Application deadline: March 15, 2024',
    },
  ],
  requiredItems: [
    {
      id: 'item-1',
      itemName: 'Transcript',
      requirementType: 'required',
      explanation: 'Official transcript required',
      evidence: [{ blockId: 'page-1', quote: 'Official transcript required' }],
      evidenceStatus: [{ verified: true, sourceLabel: 'Page 1', page: 1 }],
      text: 'Official transcript',
    },
  ],
  terms: [
    {
      term: 'FAFSA',
      explanation: 'Free Application for Federal Student Aid',
      evidence: [{ blockId: 'page-1', quote: 'FAFSA' }],
    },
  ],
  questionsToAsk: [
    {
      question: 'What is the deadline?',
      reason: 'Need clarification',
      evidence: [{ blockId: 'page-1', quote: 'deadline' }],
    },
  ],
  uncertainties: [
    {
      id: 'uncertainty-1',
      text: 'Unclear deadline',
      evidence: [{ blockId: 'page-1', quote: 'soon' }],
      evidenceStatus: [{ verified: true, sourceLabel: 'Page 1', page: 1 }],
      whyItMatters: 'Affects planning',
      suggestedQuestion: 'When is the deadline?',
    },
  ],
  messageDraft: {
    subject: 'Test Subject',
    body: 'Test body',
  },
};

describe('DocumentAnalysisSchema', () => {
  it('validates a correct analysis', () => {
    const result = DocumentAnalysisSchema.safeParse(validAnalysis);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const invalid = { ...validAnalysis, oneSentenceSummary: '' };
    const result = DocumentAnalysisSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority values', () => {
    const invalid = {
      ...validAnalysis,
      immediateActions: [
        { ...validAnalysis.immediateActions[0], priority: 'invalid' as unknown as ActionItem['priority'] },
      ],
    };
    const result = DocumentAnalysisSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid requirement types', () => {
    const invalid = {
      ...validAnalysis,
      requiredItems: [
        { ...validAnalysis.requiredItems[0], requirementType: 'invalid' as unknown as RequiredItem['requirementType'] },
      ],
    };
    const result = DocumentAnalysisSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date types', () => {
    const invalid = {
      ...validAnalysis,
      dates: [
        { ...validAnalysis.dates[0], dateType: 'invalid' as unknown as DocumentDate['dateType'] },
      ],
    };
    const result = DocumentAnalysisSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('enforces max items limits', () => {
    const tooManyActions = Array(4).fill(null).map((_, i) => ({
      ...validAnalysis.immediateActions[0],
      id: `action-${i}`,
    }));
    const invalid = { ...validAnalysis, immediateActions: tooManyActions };
    const result = DocumentAnalysisSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('validateAnalysis', () => {
  it('returns validated data for valid input', () => {
    const result = validateAnalysis(validAnalysis);
    expect(result.documentTitle).toBe('Test Document');
  });

  it('throws for invalid input', () => {
    expect(() => validateAnalysis({})).toThrow();
  });
});

describe('safeValidateAnalysis', () => {
  it('returns success for valid input', () => {
    const result = safeValidateAnalysis(validAnalysis);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documentTitle).toBe('Test Document');
    }
  });

  it('returns error for invalid input', () => {
    const result = safeValidateAnalysis({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});