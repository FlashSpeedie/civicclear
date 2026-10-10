'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, ArrowRight, CheckCircle, HelpCircle, ChevronLeft, ChevronRight, X, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { StepIndicator, Section, Callout } from '@/components/AppShell';
import { SourceBlock, PrivacyScanResult } from '@/types';
import { scanForPrivacyConcerns, redactText, getFlagLabel } from '@/lib/privacy/local-scan';
import { extractTextFromPDF, splitTextIntoBlocks, combineBlocksText } from '@/lib/documents/pdf-extraction';

const MAX_TEXT_LENGTH = 100000;
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_PAGES = 40;

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent or caregiver' },
  { value: 'applicant', label: 'Applicant' },
  { value: 'helper', label: 'Helping someone else' },
  { value: 'other', label: 'Other / prefer not to say' },
];

const SAMPLE_PLACEHOLDER = `Example: "Dear Student, Your financial aid package requires verification. Submit signed tax returns and W-2 forms within 30 days. The deadline is March 15. Contact the Financial Aid Office with questions."`;

export function LandingView({ onStart }: { onStart: () => void }) {
  const router = useRouter();
  return (
    <div className="max-w-3xl mx-auto text-center py-16 md:py-24">
      <div className="inline-flex items-center gap-2 bg-[var(--color-forest-pale)] text-[var(--color-forest)] px-4 py-2 rounded-full text-sm font-medium mb-8">
        <HelpCircle className="w-4 h-4" aria-hidden="true" />
        <span>No account needed • Private by default • Works with your documents</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold text-[var(--color-ink)] leading-tight mb-6">
        Let&apos;s make this make sense.
      </h1>
      <p className="text-lg md:text-xl text-[var(--color-ink-muted)] max-w-2xl mx-auto mb-12 leading-relaxed">
        Bring a confusing letter, application, or set of instructions. Get a plain-English explanation,
        a practical checklist, and answers you can trace back to the document.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <Button size="lg" onClick={onStart} className="w-full sm:w-auto">
          <FileText className="w-5 h-5" aria-hidden="true" />
          Start with a document
        </Button>
        <Button variant="secondary" size="lg" onClick={() => router.push('/sample')} className="w-full sm:w-auto">
          <FileSearch className="w-5 h-5" aria-hidden="true" />
          Try the sample walkthrough
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6 text-left">
        <Card variant="bordered" padding="md">
          <CardHeader>
            <div className="w-10 h-10 bg-[var(--color-forest-pale)] text-[var(--color-forest)] rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Paste text</CardTitle>
            <CardDescription>Copy and paste emails, letters, or instructions directly</CardDescription>
          </CardHeader>
        </Card>
        <Card variant="bordered" padding="md">
          <CardHeader>
            <div className="w-10 h-10 bg-[var(--color-forest-pale)] text-[var(--color-forest)] rounded-lg flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>Extract text from text-based PDFs (up to 40 pages, 12MB)</CardDescription>
          </CardHeader>
        </Card>
        <Card variant="bordered" padding="md">
          <CardHeader>
            <div className="w-10 h-10 bg-[var(--color-forest-pale)] text-[var(--color-forest)] rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <CardTitle>Get clear next steps</CardTitle>
            <CardDescription>Action checklist, deadlines, required docs, and questions to ask</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Callout variant="info" className="mt-12 max-w-2xl mx-auto text-left">
        <strong>CivicClear AI is an independent explanatory tool.</strong> It does not make official eligibility determinations,
        replace an advisor, or guarantee application acceptance. The issuing organization remains the authoritative source.
      </Callout>
    </div>
  );
}

export function DocumentInputView({
  setSourceBlocks,
  setOriginalText,
  setEditedText,
  onNext,
  onSample,
}: {
  setSourceBlocks: React.Dispatch<React.SetStateAction<SourceBlock[]>>;
  setOriginalText: React.Dispatch<React.SetStateAction<string>>;
  setEditedText: React.Dispatch<React.SetStateAction<string>>;
  onNext: () => void;
  onSample: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePasteSubmit = useCallback(() => {
    const text = pasteText.trim();
    if (!text) {
      setUploadError('Please paste some text first');
      return;
    }
    if (text.length > MAX_TEXT_LENGTH) {
      setUploadError(`Text exceeds ${MAX_TEXT_LENGTH} character limit`);
      return;
    }
    const blocks = splitTextIntoBlocks(text);
    setSourceBlocks(blocks);
    setOriginalText(text);
    setEditedText(text);
    setUploadError(null);
    onNext();
  }, [pasteText, setSourceBlocks, setOriginalText, setEditedText, onNext]);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);
    setUploadProgress(0);
    try {
      const result = await extractTextFromPDF(file, { maxPages: MAX_PAGES, maxFileSize: MAX_FILE_SIZE });
      setUploadProgress(100);
      setSourceBlocks(result.blocks);
      const fullText = combineBlocksText(result.blocks);
      setOriginalText(fullText);
      setEditedText(fullText);
      onNext();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code) {
        const messages: Record<string, string> = {
          ENCRYPTED: 'This PDF is password-protected. Please remove the password and try again.',
          NO_TEXT: 'No selectable text found. This version supports text-based PDFs only (not scanned documents).',
          TOO_LARGE: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
          TOO_MANY_PAGES: `Too many pages. Maximum is ${MAX_PAGES} pages.`,
          CORRUPT: 'Could not read this PDF. It may be corrupted.',
        };
        setUploadError(messages[err.code] || err.message || 'Unknown error');
      } else {
        setUploadError('Failed to process PDF. Please try again or paste the text instead.');
      }
      setUploadProgress(null);
    }
  }, [setSourceBlocks, setOriginalText, setEditedText, onNext]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-[var(--color-forest)]', 'bg-[var(--color-forest-pale)]');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-[var(--color-forest)]', 'bg-[var(--color-forest-pale)]');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[var(--color-forest)]', 'bg-[var(--color-forest-pale)]');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileSelect(file);
    } else if (file) {
      setUploadError('Please select a PDF file');
    }
  }, [handleFileSelect]);

  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator
        steps={[
          { id: 'input', label: 'Add document', current: true },
          { id: 'review', label: 'Review source' },
          { id: 'privacy', label: 'Privacy check' },
          { id: 'analyze', label: 'Analyze' },
        ]}
      />

      <div className="mb-6 border-b border-[var(--color-border)]">
        <nav className="flex gap-1" role="tablist" aria-label="Input method">
          <button
            role="tab"
            aria-selected={activeTab === 'paste'}
            aria-controls="paste-panel"
            id="paste-tab"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'paste'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border-b-2 border-[var(--color-forest)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Paste text
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'upload'}
            aria-controls="upload-panel"
            id="upload-tab"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'upload'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border-b-2 border-[var(--color-forest)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Upload PDF
          </button>
        </nav>
      </div>

      {uploadError && (
        <Callout variant="error" className="mb-6" title="Error">
          {uploadError}
        </Callout>
      )}

      <div role="tabpanel" id="paste-panel" aria-labelledby="paste-tab" hidden={activeTab !== 'paste'}>
        <Textarea
          ref={textareaRef}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={SAMPLE_PLACEHOLDER}
          label="Paste your document text here"
          helperText={`${pasteText.length} / ${MAX_TEXT_LENGTH} characters`}
          rows={12}
        />
        <div className="flex gap-3 mt-4">
          <Button onClick={handlePasteSubmit} disabled={!pasteText.trim() || pasteText.length > MAX_TEXT_LENGTH}>
            Continue
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" onClick={onSample}>
            Try sample instead
          </Button>
        </div>
      </div>

      <div role="tabpanel" id="upload-panel" aria-labelledby="upload-tab" hidden={activeTab !== 'upload'}>
        <div
          className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-colors ${
            uploadProgress ? 'border-[var(--color-forest)] bg-[var(--color-forest-pale)]' : 'border-[var(--color-border)] hover:border-[var(--color-forest)]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileSelect(); }}}
          aria-label="Drop zone for PDF upload"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Select PDF file"
          />
          {uploadProgress !== null ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-[var(--color-border)] border-t-[var(--color-forest)] rounded-full animate-spin" aria-hidden="true" />
              <div>
                <p className="font-medium text-[var(--color-ink)]">Extracting text from PDF...</p>
                <p className="text-sm text-[var(--color-ink-muted)]">{Math.round(uploadProgress)}% complete</p>
              </div>
              <div className="w-full max-w-xs mx-auto" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-forest)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto text-[var(--color-ink-light)] mb-4" aria-hidden="true" />
              <p className="text-lg font-medium text-[var(--color-ink)] mb-1">Drop a PDF here or click to browse</p>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">Text-based PDFs only • Up to {MAX_PAGES} pages • Max {MAX_FILE_SIZE / (1024 * 1024)} MB</p>
              <Button variant="secondary" onClick={triggerFileSelect}>
                Choose PDF file
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-3 mt-4 justify-center">
          <Button variant="ghost" onClick={onSample}>
            Try sample instead
          </Button>
        </div>
      </div>

      <Callout variant="info" className="mt-8" title="What works best">
        <ul className="list-disc list-inside space-y-1 text-sm text-[var(--color-ink-muted)]">
          <li>Text-based PDFs (not scanned images)</li>
          <li>Emails, letters, application instructions, requirement lists</li>
          <li>Documents under 100,000 characters</li>
        </ul>
      </Callout>
    </div>
  );
}

export function SourceReviewView({
  sourceBlocks,
  editedText,
  setEditedText,
  onBack,
  onNext,
}: {
  sourceBlocks: SourceBlock[];
  editedText: string;
  setEditedText: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const totalChars = editedText.length;
  const isOverLimit = totalChars > MAX_TEXT_LENGTH;

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator
        steps={[
          { id: 'input', label: 'Add document', complete: true },
          { id: 'review', label: 'Review source', current: true },
          { id: 'privacy', label: 'Privacy check' },
          { id: 'analyze', label: 'Analyze' },
        ]}
      />

      <Section title="Review extracted text" description={sourceBlocks.length > 1 ? `${sourceBlocks.length} sections • ${totalChars.toLocaleString()} characters` : `${totalChars.toLocaleString()} characters`} className="mb-6">
        {isOverLimit && (
          <Callout variant="error" className="mb-4" title="Text too long">
            The text exceeds the {MAX_TEXT_LENGTH.toLocaleString()} character limit. Please edit it down before continuing.
          </Callout>
        )}

        <div className="space-y-4">
          {sourceBlocks.map((block) => (
            <Card key={block.id} variant="bordered" padding="md" className="overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="badge badge-primary shrink-0">{block.label}</span>
                  <span className="text-sm text-[var(--color-ink-muted)]">
                    {block.page ? `Page ${block.page}` : 'Pasted text'}
                  </span>
                </div>
                <button
                  onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                  className="p-1 rounded hover:bg-[var(--color-surface-hover)] transition-colors"
                  aria-expanded={expandedBlock === block.id}
                  aria-controls={`block-${block.id}`}
                >
                  <ChevronRight className={`w-5 h-5 text-[var(--color-ink-muted)] transition-transform ${expandedBlock === block.id ? 'rotate-90' : ''}`} aria-hidden="true" />
                </button>
              </div>
              <div id={`block-${block.id}`} className={`transition-all duration-200 ${expandedBlock !== block.id ? 'max-h-24 overflow-hidden' : ''}`}>
                <textarea
                  value={block.text}
                  onChange={(e) => {
                    const newBlocks = sourceBlocks.map((b) => b.id === block.id ? { ...b, text: e.target.value } : b);
                    // We can't easily update sourceBlocks here without lifting state up
                    // For now, just update the editedText which will be used for analysis
                    setEditedText(newBlocks.map(b => b.text).join('\n\n'));
                  }}
                  className="w-full min-h-[80px] font-mono text-sm text-[var(--color-ink)] bg-transparent border-0 resize-none focus:outline-none"
                  readOnly={expandedBlock !== block.id}
                  aria-label={`Edit ${block.label}`}
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </Button>
          <Button onClick={onNext} disabled={isOverLimit || sourceBlocks.length === 0}>
            Continue
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </Section>

      <Callout variant="info" className="mb-6" title="Tip">
        You can edit any section above to fix extraction errors, remove irrelevant parts, or redact personal details before analysis.
      </Callout>
    </div>
  );
}

export function PrivacyReviewView({
  sourceBlocks,
  editedText,
  privacyConfirmed,
  setPrivacyConfirmed,
  onBack,
  onNext,
}: {
  sourceBlocks: SourceBlock[];
  editedText: string;
  privacyConfirmed: boolean;
  setPrivacyConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const [scanResult, setScanResult] = useState<PrivacyScanResult | null>(null);
  const [showRedacted, setShowRedacted] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!scanned && sourceBlocks.length > 0) {
      const result = scanForPrivacyConcerns(sourceBlocks);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanResult(result);
      setScanned(true);
    }
  }, [sourceBlocks, scanned]);

  const redactedText = scanResult
    ? sourceBlocks.map((block) => redactText(block.text, scanResult.flagged, block.id)).join('\n\n')
    : editedText;

  const handleConfirm = () => {
    if (!privacyConfirmed) return;
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator
        steps={[
          { id: 'input', label: 'Add document', complete: true },
          { id: 'review', label: 'Review source', complete: true },
          { id: 'privacy', label: 'Privacy check', current: true },
          { id: 'analyze', label: 'Analyze' },
        ]}
      />

      <Section title="Privacy checkpoint" description="Before analysis, review what will be sent to the AI provider" className="mb-6">
        <Callout variant="warning" className="mb-6" title="Your document will be sent to Google Gemini">
          <div className="space-y-3">
            <p>Review the extracted text first and remove details you don&apos;t need to share.</p>
            <p>This app does not save your documents to its own database by default, but the AI provider&apos;s own data handling policies may apply.</p>
            <p><strong>Do not submit sensitive information you are not comfortable sharing.</strong></p>
          </div>
        </Callout>

        {scanResult && scanResult.flagged.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-[var(--color-ink)] mb-3">Potential sensitive content detected</h4>
            <p className="text-sm text-[var(--color-ink-muted)] mb-3">
              This automated scan found {scanResult.flagged.length} item{scanResult.flagged.length > 1 ? 's' : ''} that may contain sensitive information.
              It is not exhaustive — review manually as well.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {scanResult.flagged.map((flag, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                  <Badge variant="amber">{getFlagLabel(flag.type)}</Badge>
                  <code className="flex-1 text-sm text-[var(--color-ink)] bg-[var(--color-paper)] px-2 py-1 rounded">{flag.text}</code>
                  <span className="text-xs text-[var(--color-ink-light)]">in {flag.blockId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyConfirmed}
              onChange={(e) => setPrivacyConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-forest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-pale)]"
              aria-required="true"
            />
            <div>
              <p className="font-medium text-[var(--color-ink)]">I understand my document text will be sent to Google Gemini for analysis</p>
              <p className="text-sm text-[var(--color-ink-muted)]">I have reviewed the text and redacted any sensitive details I don&apos;t want to share</p>
            </div>
          </label>
        </div>

        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <div className="flex border-b border-[var(--color-border)]">
            <button
              onClick={() => setShowRedacted(false)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${!showRedacted ? 'bg-[var(--color-surface)] text-[var(--color-ink)]' : 'bg-transparent text-[var(--color-ink-muted)]'}`}
            >
              Original text
            </button>
            <button
              onClick={() => setShowRedacted(true)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${showRedacted ? 'bg-[var(--color-surface)] text-[var(--color-ink)]' : 'bg-transparent text-[var(--color-ink-muted)]'}`}
            >
              With redactions
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap text-[var(--color-ink)]">
            {showRedacted ? redactedText : editedText}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </Button>
          <Button onClick={handleConfirm} disabled={!privacyConfirmed} aria-describedby={!privacyConfirmed ? 'consent-required-hint' : undefined}>
            Make this understandable
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
          {!privacyConfirmed && (
            <p id="consent-required-hint" className="text-sm text-[var(--color-ink-muted)]" role="status">
              Check the confirmation box to continue.
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}

export function ContextInputView({
  userContext,
  setUserContext,
  userRole,
  setUserRole,
  referenceDate,
  setReferenceDate,
  onBack,
  onNext,
}: {
  userContext: string;
  setUserContext: React.Dispatch<React.SetStateAction<string>>;
  userRole: string;
  setUserRole: React.Dispatch<React.SetStateAction<string>>;
  referenceDate: string;
  setReferenceDate: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator
        steps={[
          { id: 'input', label: 'Add document', complete: true },
          { id: 'review', label: 'Review source', complete: true },
          { id: 'privacy', label: 'Privacy check', complete: true },
          { id: 'context', label: 'Your situation', current: true },
          { id: 'analyze', label: 'Analyze' },
        ]}
      />

      <Section title="What are you trying to figure out?" description="Optional — helps tailor the explanation to your situation" className="mb-6">
        <Textarea
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          placeholder="e.g., I want to know which scholarship documents I need"
          label="Your question or goal"
          helperText="You don't need to share personal details — just what you're trying to understand"
          rows={4}
        />

        <Select
          label="Your role (optional)"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          options={ROLE_OPTIONS}
          placeholder="Select your role"
        />

        <div className="mt-4">
          <label className="label">Reference date (optional)</label>
          <input
            type="date"
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
            className="input"
          />
          <p className="mt-1.5 text-sm text-[var(--color-ink-light)]">
            If your document mentions relative deadlines (e.g., &apos;within 14 days&apos;), provide the reference date (e.g., when you received the letter)
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </Button>
          <Button onClick={onNext}>
            Analyze document
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </Section>
    </div>
  );
}

export function AnalyzingView() {
  const messages = [
    'Preparing your document…',
    'Checking the instructions…',
    'Organizing your next steps…',
  ];

  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <StepIndicator
        steps={[
          { id: 'input', label: 'Add document', complete: true },
          { id: 'review', label: 'Review source', complete: true },
          { id: 'privacy', label: 'Privacy check', complete: true },
          { id: 'context', label: 'Your situation', complete: true },
          { id: 'analyze', label: 'Analyze', current: true },
        ]}
      />

      <div className="mt-12 space-y-6">
        <div className="w-16 h-16 mx-auto border-4 border-[var(--color-border)] border-t-[var(--color-forest)] rounded-full animate-spin" aria-hidden="true" />
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Analyzing your document</h2>
        <p className="text-[var(--color-ink-muted)]" id="status-message" aria-live="polite">
          {messages[0]}
        </p>
      </div>
    </div>
  );
}