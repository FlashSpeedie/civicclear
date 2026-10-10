'use client';

import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, FileText, Calendar, AlertCircle, HelpCircle, MessageSquare, Check, CheckCircle, X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Section, Callout, Collapsible } from '@/components/AppShell';
import { DocumentAnalysis, ActionItem, DocumentDate, RequiredItem, EvidenceStatus } from '@/types';
import { cn, formatDate } from '@/lib/utils';

interface EvidenceViewerProps {
  evidence: Array<{ blockId: string; quote: string }>;
  evidenceStatus: EvidenceStatus[] | undefined;
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
  title?: string;
}

export function EvidenceViewer({ evidence, evidenceStatus, sourceBlocks, title = 'Source evidence' }: EvidenceViewerProps) {
  const [open, setOpen] = useState(false);
  const blockMap = new Map(sourceBlocks.map((b) => [b.id, b]));

  if (evidence.length === 0) return null;

  return (
    <Collapsible title={`${title} (${evidence.length})`} defaultOpen={false}>
      <div className="space-y-3">
        {evidence.map((ref, index) => {
          const block = blockMap.get(ref.blockId);
          const status = evidenceStatus?.[index];
          return (
            <Card key={index} variant="bordered" padding="sm" className="border-l-4 border-[var(--color-forest)]">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest-pale)] text-[var(--color-forest)] flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-ink)] italic">&ldquo;{ref.quote}&rdquo;</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      Source: {block?.label || ref.blockId}
                      {block?.page && ` • Page ${block.page}`}
                    </span>
                    {status && (
                      <Badge variant={status.verified ? 'success' : 'error'} size="sm">
                        {status.verified ? 'Verified' : 'Not verified'}
                      </Badge>
                    )}
                  </div>
                  {block && (
                    <button
                      onClick={() => navigator.clipboard.writeText(block.text)}
                      className="mt-2 text-xs text-[var(--color-forest)] hover:underline"
                    >
                      Copy full section text
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Collapsible>
  );
}

interface SummarySectionProps {
  analysis: DocumentAnalysis;
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
}

export function SummarySection({ analysis, sourceBlocks }: SummarySectionProps) {
  return (
    <Section title="The gist" description="A quick overview of what this document is and what it means for you">
      <Card variant="bordered" padding="md">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-[var(--color-ink)] mb-1">What kind of document is this?</h3>
            <p className="text-[var(--color-ink-muted)]">{analysis.documentType}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--color-ink)] mb-1">One-sentence summary</h3>
            <p className="text-[var(--color-ink)]">{analysis.oneSentenceSummary}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--color-ink)] mb-1">Plain-English explanation</h3>
            <p className="text-[var(--color-ink)] whitespace-pre-line">{analysis.plainEnglishSummary}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--color-ink)] mb-1">Why this matters</h3>
            <p className="text-[var(--color-ink)] whitespace-pre-line">{analysis.whyItMatters}</p>
          </div>
        </div>
      </Card>
    </Section>
  );
}

interface ImmediateActionsProps {
  actions: ActionItem[];
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
}

export function ImmediateActionsProps({ actions, sourceBlocks }: ImmediateActionsProps) {
  return (
    <Section title="Start here" description="The three most important immediate actions, if the document supports them">
      {actions.length === 0 ? (
        <Callout variant="info" title="No immediate actions identified">
          The document doesn&apos;t appear to specify clear immediate next steps, or they couldn&apos;t be determined from the text provided.
        </Callout>
      ) : (
        <div className="space-y-4">
          {actions.map((action, index) => (
            <Card key={action.id} variant="bordered" padding="md" className="border-l-4 border-[var(--color-forest)]">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest)] text-white flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--color-ink)]">{action.text}</h4>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{action.details}</p>
                  {action.dependsOn.length > 0 && (
                    <p className="mt-2 text-sm text-[var(--color-amber)]">
                      Depends on: {action.dependsOn.join(', ')}
                    </p>
                  )}
                  <EvidenceViewer evidence={action.evidence} evidenceStatus={action.evidenceStatus} sourceBlocks={sourceBlocks} title="Why this action" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

interface ChecklistProps {
  checklist: ActionItem[];
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
  onToggle: (id: string, checked: boolean) => void;
  checkedItems: Set<string>;
}

export function Checklist({ checklist, sourceBlocks, onToggle, checkedItems }: ChecklistProps) {
  const categories = [
    { key: 'high', label: 'Do now', items: checklist.filter((i) => i.priority === 'high') },
    { key: 'normal', label: 'Before submitting', items: checklist.filter((i) => i.priority === 'normal') },
    { key: 'low', label: 'Later / follow up', items: checklist.filter((i) => i.priority === 'low') },
  ].filter((c) => c.items.length > 0);

  return (
    <Section title="Your checklist" description="Track your progress — check off items as you complete them">
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.key}>
            <h3 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">{category.label}</h3>
            <div className="space-y-2">
              {category.items.map((item) => (
                <Card key={item.id} variant="bordered" padding="sm" className={cn('transition-colors', checkedItems.has(item.id) && 'bg-[var(--color-success-pale)] border-[var(--color-success)]')}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(item.id)}
                      onChange={(e) => onToggle(item.id, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-forest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-pale)]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium text-[var(--color-ink)]', checkedItems.has(item.id) && 'line-through')}>{item.text}</p>
                      {item.details && <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{item.details}</p>}
                      {item.dependsOn.length > 0 && (
                        <p className="mt-1 text-xs text-[var(--color-amber)]">Depends on: {item.dependsOn.join(', ')}</p>
                      )}
                      <EvidenceViewer evidence={item.evidence} evidenceStatus={item.evidenceStatus} sourceBlocks={sourceBlocks} title="Source" />
                    </div>
                  </label>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            const text = checklist.map((item) => `- [${checkedItems.has(item.id) ? 'x' : ' '}] ${item.text}`).join('\n');
            navigator.clipboard.writeText(text);
          }}
        >
          <Copy className="w-4 h-4" aria-hidden="true" />
          Copy checklist
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>
          <Printer className="w-4 h-4" aria-hidden="true" />
          Print summary
        </Button>
      </div>
    </Section>
  );
}

interface DatesListProps {
  dates: DocumentDate[];
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
}

export function DatesList({ dates, sourceBlocks }: DatesListProps) {
  if (dates.length === 0) {
    return (
      <Section title="Dates that matter" description="No explicit deadlines or dates were found in the reviewed text">
        <Callout variant="info" title="No dates found">
          The document does not appear to contain specific deadlines or important dates. If you know of a deadline not mentioned here, note it separately.
        </Callout>
      </Section>
    );
  }

  const grouped = dates.reduce((acc, date) => {
    if (!acc[date.dateType]) acc[date.dateType] = [];
    acc[date.dateType].push(date);
    return acc;
  }, {} as Record<string, DocumentDate[]>);

  const typeOrder = ['deadline', 'event', 'effective', 'payment', 'other'];
  const typeLabels: Record<string, string> = {
    deadline: 'Deadlines',
    event: 'Events',
    effective: 'Effective dates',
    payment: 'Payment dates',
    other: 'Other dates',
  };

  return (
    <Section title="Dates that matter" description="Important deadlines and dates from the document">
      <div className="space-y-6">
        {typeOrder.map((type) => {
          const items = grouped[type];
          if (!items || items.length === 0) return null;
          return (
            <div key={type}>
              <h3 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">{typeLabels[type]}</h3>
              <div className="space-y-3">
                {items.map((date) => (
                  <Card key={date.id} variant="bordered" padding="md" className={cn(
                    date.needsConfirmation && 'border-l-4 border-[var(--color-amber)]',
                    date.dateType === 'deadline' && !date.needsConfirmation && 'border-l-4 border-[var(--color-error)]'
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[var(--color-ink)]">{date.label}</span>
                          {date.needsConfirmation && <Badge variant="amber" size="sm">Needs confirmation</Badge>}
                          {date.dateType === 'deadline' && !date.needsConfirmation && <Badge variant="error" size="sm">Deadline</Badge>}
                        </div>
                        <p className="text-[var(--color-ink)]">{date.explanation}</p>
                        <div className="mt-2 flex items-center gap-3 text-sm">
                          <span className="text-[var(--color-ink-muted)]">Original: <span className="font-mono text-[var(--color-ink)]">{date.originalPhrase}</span></span>
                          {date.normalizedDate && (
                            <span className="text-[var(--color-forest)]">Normalized: <span className="font-mono">{formatDate(date.normalizedDate)}</span></span>
                          )}
                        </div>
                        <EvidenceViewer evidence={date.evidence} evidenceStatus={date.evidenceStatus} sourceBlocks={sourceBlocks} title="Source" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

interface RequiredItemsProps {
  items: RequiredItem[];
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
}

export function RequiredItems({ items, sourceBlocks }: RequiredItemsProps) {
  if (items.length === 0) return null;

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.requirementType]) acc[item.requirementType] = [];
    acc[item.requirementType].push(item);
    return acc;
  }, {} as Record<string, RequiredItem[]>);

  const typeOrder = ['required', 'conditional', 'optional', 'unclear'];
  const typeLabels: Record<string, string> = {
    required: 'Required',
    conditional: 'Conditional',
    optional: 'Optional',
    unclear: 'Unclear',
  };
  const typeVariants: Record<string, 'primary' | 'amber' | 'neutral' | 'error'> = {
    required: 'error',
    conditional: 'amber',
    optional: 'neutral',
    unclear: 'primary',
  };

  return (
    <Section title="Documents and information you'll need" description="Items explicitly mentioned in the document">
      <div className="space-y-6">
        {typeOrder.map((type) => {
          const typeItems = grouped[type];
          if (!typeItems || typeItems.length === 0) return null;
          return (
            <div key={type}>
              <h3 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                {typeLabels[type]}
                <Badge variant={typeVariants[type]} size="sm">{typeItems.length}</Badge>
              </h3>
              <div className="space-y-2">
                {typeItems.map((item) => (
                  <Card key={item.id} variant="bordered" padding="sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--color-ink)]">{item.itemName}</p>
                        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{item.explanation}</p>
                        <EvidenceViewer evidence={item.evidence} evidenceStatus={item.evidenceStatus} sourceBlocks={sourceBlocks} title="Source" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

interface TermsProps {
  terms: Array<{ term: string; explanation: string; evidence: Array<{ blockId: string; quote: string }> }>;
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
}

export function Terms({ terms, sourceBlocks }: TermsProps) {
  if (terms.length === 0) return null;

  return (
    <Section title="What these terms mean" description="Definitions for formal or unfamiliar terms in the document">
      <div className="space-y-3">
        {terms.map((term) => (
          <Card key={term.term} variant="bordered" padding="sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <code className="px-2 py-1 bg-[var(--color-forest-pale)] text-[var(--color-forest)] rounded text-sm font-medium">{term.term}</code>
              </div>
              <div className="flex-1">
                <p className="text-[var(--color-ink)]">{term.explanation}</p>
                <EvidenceViewer evidence={term.evidence} evidenceStatus={undefined} sourceBlocks={sourceBlocks} title="Where it appears" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

interface QuestionsToAskProps {
  questions: Array<{ question: string; reason: string; evidence: Array<{ blockId: string; quote: string }> }>;
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
}

export function QuestionsToAsk({ questions, sourceBlocks }: QuestionsToAskProps) {
  if (questions.length === 0) return null;

  return (
    <Section title="Questions worth asking" description="Unresolved questions that could change what you need to do">
      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={index} variant="bordered" padding="md" className="border-l-4 border-[var(--color-amber)]">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[var(--color-amber)] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-medium text-[var(--color-ink)]">{q.question}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{q.reason}</p>
                <EvidenceViewer evidence={q.evidence} evidenceStatus={undefined} sourceBlocks={sourceBlocks} title="Related text" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

interface MessageDraftProps {
  draft: { subject: string; body: string } | null;
}

export function MessageDraft({ draft }: MessageDraftProps) {
  const [tone, setTone] = useState<'direct' | 'formal' | 'conversational'>('direct');

  if (!draft) return null;

  return (
    <Section title="Help me ask" description="A draft message you can review, edit, and send yourself">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['direct', 'formal', 'conversational'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                tone === t
                  ? 'bg-[var(--color-forest)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]'
              )}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Subject</label>
            <input
              type="text"
              defaultValue={draft.subject}
              className="input font-mono"
              readOnly
            />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              defaultValue={draft.body}
              className="textarea input font-mono text-sm"
              readOnly
              rows={12}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`)}>
            <Copy className="w-4 h-4" aria-hidden="true" />
            Copy message
          </Button>
          <Button variant="ghost">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Open in email
          </Button>
        </div>

        <Callout variant="info" className="mt-4" title="Note">
          This app does not send emails. Copy the draft, review it, and send it yourself. Replace placeholders like [office name] and [your name] before sending.
        </Callout>
      </div>
    </Section>
  );
}

interface UncertaintiesProps {
  uncertainties: Array<{ id: string; text: string; evidence: Array<{ blockId: string; quote: string }>; whyItMatters: string; suggestedQuestion: string }>;
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
}

export function Uncertainties({ uncertainties, sourceBlocks }: UncertaintiesProps) {
  if (uncertainties.length === 0) return null;

  return (
    <Section title="What we couldn't determine" description="Gaps, ambiguities, or conflicts in the document that need clarification">
      <div className="space-y-4">
        {uncertainties.map((u) => (
          <Card key={u.id} variant="bordered" padding="md" className="border-l-4 border-[var(--color-error)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-medium text-[var(--color-ink)]">{u.text}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]"><strong>Why it matters:</strong> {u.whyItMatters}</p>
                <p className="mt-1 text-sm text-[var(--color-forest)]"><strong>Suggested question:</strong> {u.suggestedQuestion}</p>
                <EvidenceViewer evidence={u.evidence} evidenceStatus={undefined} sourceBlocks={sourceBlocks} title="Source" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function AnalysisWorkspace({
  analysis,
  sourceBlocks,
  onReset,
}: {
  analysis: DocumentAnalysis;
  sourceBlocks: Array<{ id: string; label: string; page: number | null; text: string }>;
  onReset: () => void;
}) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-ink)]">
            {analysis.documentTitle || 'Document Analysis'}
          </h1>
          <p className="text-[var(--color-ink-muted)]">{analysis.documentType}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" aria-hidden="true" />
            Print
          </Button>
          <Button variant="ghost" onClick={onReset}>
            <X className="w-4 h-4" aria-hidden="true" />
            Start over
          </Button>
        </div>
      </div>

      <SummarySection analysis={analysis} sourceBlocks={sourceBlocks} />
      <ImmediateActionsProps actions={analysis.immediateActions} sourceBlocks={sourceBlocks} />
      <Checklist checklist={analysis.checklist} sourceBlocks={sourceBlocks} onToggle={toggleCheck} checkedItems={checkedItems} />
      <DatesList dates={analysis.dates} sourceBlocks={sourceBlocks} />
      <RequiredItems items={analysis.requiredItems} sourceBlocks={sourceBlocks} />
      <Terms terms={analysis.terms} sourceBlocks={sourceBlocks} />
      <QuestionsToAsk questions={analysis.questionsToAsk} sourceBlocks={sourceBlocks} />
      <MessageDraft draft={analysis.messageDraft} />
      <Uncertainties uncertainties={analysis.uncertainties} sourceBlocks={sourceBlocks} />

      <Callout variant="info" className="mt-8" title="Important reminder">
        CivicClear AI is an independent explanatory tool. It does not make official eligibility determinations,
        replace an advisor, or guarantee application acceptance. The issuing organization remains the authoritative source.
        Verify all deadlines, requirements, and details with the official source before taking action.
      </Callout>
    </div>
  );
}