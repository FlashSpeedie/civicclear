export interface SourceBlock {
  id: string;
  label: string;
  page: number | null;
  text: string;
}

export interface EvidenceReference {
  blockId: string;
  quote: string;
}

export interface EvidenceStatus {
  verified: boolean;
  sourceLabel: string;
  page: number | null;
}

export interface SupportedFinding {
  id: string;
  text: string;
  evidence: EvidenceReference[];
  evidenceStatus?: EvidenceStatus[];
}

export interface ActionItem extends SupportedFinding {
  priority: 'high' | 'normal' | 'low';
  details: string;
  dependsOn: string[];
  dueDateId: string | null;
}

export interface DocumentDate extends SupportedFinding {
  label: string;
  originalPhrase: string;
  normalizedDate: string | null;
  dateType: 'deadline' | 'event' | 'effective' | 'payment' | 'other';
  needsConfirmation: boolean;
  explanation: string;
}

export interface RequiredItem extends SupportedFinding {
  itemName: string;
  requirementType: 'required' | 'optional' | 'conditional' | 'unclear';
  explanation: string;
}

export interface Uncertainty extends SupportedFinding {
  whyItMatters: string;
  suggestedQuestion: string;
}

export interface DocumentAnalysis {
  documentTitle: string | null;
  documentType: string;
  oneSentenceSummary: string;
  plainEnglishSummary: string;
  whyItMatters: string;
  immediateActions: ActionItem[];
  checklist: ActionItem[];
  dates: DocumentDate[];
  requiredItems: RequiredItem[];
  terms: Array<{
    term: string;
    explanation: string;
    evidence: EvidenceReference[];
  }>;
  questionsToAsk: Array<{
    question: string;
    reason: string;
    evidence: EvidenceReference[];
  }>;
  uncertainties: Uncertainty[];
  messageDraft: {
    subject: string;
    body: string;
  } | null;
}

export interface AnalysisRequest {
  sourceBlocks: SourceBlock[];
  userContext?: string;
  userRole?: string;
  referenceDate?: string;
}

export interface AnalysisResponse {
  analysis: DocumentAnalysis;
  warnings?: string[];
}

export interface PrivacyScanResult {
  flagged: Array<{
    type: 'email' | 'phone' | 'ssn' | 'card' | 'secret';
    text: string;
    blockId: string;
    startIndex: number;
    endIndex: number;
  }>;
  message: string;
}

export interface PDFExtractionResult {
  blocks: SourceBlock[];
  pageCount: number;
  fileName: string;
  fileSize: number;
}

export interface AppState {
  step: 'welcome' | 'input' | 'review' | 'privacy' | 'analyzing' | 'results' | 'sample';
  sourceBlocks: SourceBlock[];
  originalText: string;
  editedText: string;
  userContext: string;
  userRole: string;
  referenceDate: string;
  privacyConfirmed: boolean;
  analysis: DocumentAnalysis | null;
  error: string | null;
  isLoading: boolean;
}