'use client';

import { useState } from 'react';
import { ArrowRight, ChevronLeft, FileText, CheckCircle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { StepIndicator, Section, Callout, Collapsible } from '@/components/AppShell';
import { AnalysisWorkspace } from './AnalysisWorkspace';
import { SAMPLE_SOURCE_BLOCKS } from '@/lib/sample/sample-document';
import { SAMPLE_ANALYSIS } from '@/lib/sample/sample-analysis';
import { SourceBlock } from '@/types';
import { cn } from '@/lib/utils';

export function SampleWalkthrough() {
  const [step, setStep] = useState<'intro' | 'document' | 'analysis'>('intro');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Badge variant="primary" className="mb-6">Sample walkthrough — fictional example, no live AI analysis</Badge>
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-ink)] mb-4">
          See how CivicClear works
        </h1>
        <p className="text-lg text-[var(--color-ink-muted)] mb-8 max-w-2xl mx-auto">
          Walk through a fictional scholarship application to see the kind of analysis CivicClear provides.
          This example uses a pre-written analysis — no API key needed.
        </p>
        <Card variant="bordered" padding="md" className="text-left max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Meridian Founders Scholarship</CardTitle>
            <CardDescription>Fictional scholarship application instructions for Meridian Community College</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-ink-muted)]">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" /> 5-page document with eligibility, requirements, deadlines</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" /> Clear deadline (March 15, 2024)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" /> 7 required application items</li>
              <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-[var(--color-amber)]" aria-hidden="true" /> Ambiguous community service form</li>
              <li className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-[var(--color-forest)]" aria-hidden="true" /> Questions about GPA scale, interview format</li>
            </ul>
          </CardContent>
        </Card>
        <div className="mt-8">
          <Button size="lg" onClick={() => setStep('document')}>
            Start walkthrough
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'document') {
    return (
      <div className="max-w-3xl mx-auto">
        <StepIndicator
          steps={[
            { id: 'intro', label: 'Introduction', complete: true },
            { id: 'document', label: 'Sample document', current: true },
            { id: 'analysis', label: 'Analysis results' },
          ]}
        />

        <Section title="Sample document" description="Fictional scholarship instructions — 5 pages extracted as text blocks">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {SAMPLE_SOURCE_BLOCKS.map((block) => (
              <Card key={block.id} variant="bordered" padding="md">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="primary">{block.label}</Badge>
                </div>
                <div className="font-mono text-sm text-[var(--color-ink)] whitespace-pre-wrap">
                  {block.text}
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep('intro')}>
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
            <Button onClick={() => setStep('analysis')}>
              See the analysis
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator
        steps={[
          { id: 'intro', label: 'Introduction', complete: true },
          { id: 'document', label: 'Sample document', complete: true },
          { id: 'analysis', label: 'Analysis results', current: true },
        ]}
      />

      <Badge variant="primary" className="mb-6 inline-block">Sample walkthrough — fictional example, no live AI analysis</Badge>

      <AnalysisWorkspace
        analysis={SAMPLE_ANALYSIS}
        sourceBlocks={SAMPLE_SOURCE_BLOCKS}
        onReset={() => {
          setStep('intro');
          setCheckedItems(new Set());
        }}
      />
    </div>
  );
}