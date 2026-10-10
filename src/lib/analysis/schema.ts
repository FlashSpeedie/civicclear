import { z } from 'zod';
import { DocumentAnalysis, EvidenceReference, SourceBlock } from '@/types';

export const EvidenceReferenceSchema = z.object({
  blockId: z.string().min(1),
  quote: z.string().min(1),
});

export const EvidenceStatusSchema = z.object({
  verified: z.boolean(),
  sourceLabel: z.string(),
  page: z.number().nullable(),
});

export const SupportedFindingSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  evidence: z.array(EvidenceReferenceSchema),
  evidenceStatus: z.array(EvidenceStatusSchema).optional(),
});

export const ActionItemSchema = SupportedFindingSchema.extend({
  priority: z.enum(['high', 'normal', 'low']),
  details: z.string(),
  dependsOn: z.array(z.string()),
  dueDateId: z.string().nullable(),
});

export const DocumentDateSchema = SupportedFindingSchema.extend({
  label: z.string(),
  originalPhrase: z.string(),
  normalizedDate: z.string().nullable(),
  dateType: z.enum(['deadline', 'event', 'effective', 'payment', 'other']),
  needsConfirmation: z.boolean(),
  explanation: z.string(),
});

export const RequiredItemSchema = SupportedFindingSchema.extend({
  itemName: z.string(),
  requirementType: z.enum(['required', 'optional', 'conditional', 'unclear']),
  explanation: z.string(),
});

export const UncertaintySchema = SupportedFindingSchema.extend({
  whyItMatters: z.string(),
  suggestedQuestion: z.string(),
});

export const TermSchema = z.object({
  term: z.string(),
  explanation: z.string(),
  evidence: z.array(EvidenceReferenceSchema),
});

export const QuestionToAskSchema = z.object({
  question: z.string(),
  reason: z.string(),
  evidence: z.array(EvidenceReferenceSchema),
});

export const MessageDraftSchema = z.object({
  subject: z.string(),
  body: z.string(),
}).nullable();

export const DocumentAnalysisSchema = z.object({
  documentTitle: z.string().nullable(),
  documentType: z.string().min(1),
  oneSentenceSummary: z.string().min(1).max(300),
  plainEnglishSummary: z.string().min(1).max(2000),
  whyItMatters: z.string().min(1).max(1000),
  immediateActions: z.array(ActionItemSchema).max(3),
  checklist: z.array(ActionItemSchema).max(20),
  dates: z.array(DocumentDateSchema).max(15),
  requiredItems: z.array(RequiredItemSchema).max(20),
  terms: z.array(TermSchema).max(15),
  questionsToAsk: z.array(QuestionToAskSchema).max(10),
  uncertainties: z.array(UncertaintySchema).max(10),
  messageDraft: MessageDraftSchema,
});

export type ValidatedDocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

export function validateAnalysis(data: unknown): ValidatedDocumentAnalysis {
  return DocumentAnalysisSchema.parse(data);
}

export function safeValidateAnalysis(data: unknown): { success: true; data: ValidatedDocumentAnalysis } | { success: false; error: z.ZodError } {
  const result = DocumentAnalysisSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}