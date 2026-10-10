'use client';

import { useState, useCallback } from 'react';
import { AppShell } from '@/components/AppShell';
import { LandingView } from '@/components/DocumentInput';
import { DocumentInputView, SourceReviewView, PrivacyReviewView, ContextInputView, AnalyzingView } from '@/components/DocumentInput';
import { AnalysisWorkspace } from '@/components/AnalysisWorkspace';
import { SampleWalkthrough } from '@/components/SampleWalkthrough';
import { SourceBlock, DocumentAnalysis } from '@/types';
import { Callout } from '@/components/AppShell';

type AppStep = 'welcome' | 'input' | 'review' | 'privacy' | 'context' | 'analyzing' | 'results' | 'sample';

interface AppState {
  step: AppStep;
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

const initialState: AppState = {
  step: 'welcome',
  sourceBlocks: [],
  originalText: '',
  editedText: '',
  userContext: '',
  userRole: '',
  referenceDate: '',
  privacyConfirmed: false,
  analysis: null,
  error: null,
  isLoading: false,
};

export default function Home() {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = useCallback((partial: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const setSourceBlocks = useCallback((blocks: SourceBlock[] | ((prev: SourceBlock[]) => SourceBlock[])) => {
    updateState({ sourceBlocks: typeof blocks === 'function' ? blocks(state.sourceBlocks) : blocks });
  }, []);

  const setOriginalText = useCallback((text: string | ((prev: string) => string)) => {
    updateState({ originalText: typeof text === 'function' ? text(state.originalText) : text });
  }, []);

  const setEditedText = useCallback((text: string | ((prev: string) => string)) => {
    updateState({ editedText: typeof text === 'function' ? text(state.editedText) : text });
  }, []);

  const setPrivacyConfirmed = useCallback((confirmed: boolean | ((prev: boolean) => boolean)) => {
    updateState({ privacyConfirmed: typeof confirmed === 'function' ? confirmed(state.privacyConfirmed) : confirmed });
  }, []);

  const setUserContext = useCallback((context: string | ((prev: string) => string)) => {
    updateState({ userContext: typeof context === 'function' ? context(state.userContext) : context });
  }, []);

  const setUserRole = useCallback((role: string | ((prev: string) => string)) => {
    updateState({ userRole: typeof role === 'function' ? role(state.userRole) : role });
  }, []);

  const setReferenceDate = useCallback((date: string | ((prev: string) => string)) => {
    updateState({ referenceDate: typeof date === 'function' ? date(state.referenceDate) : date });
  }, []);

  const handleStart = () => {
    updateState({ step: 'input', error: null });
  };

  const handleSample = () => {
    updateState({ step: 'sample' });
  };

  const handleInputNext = () => {
    updateState({ step: 'review' });
  };

  const handleReviewNext = () => {
    updateState({ step: 'privacy', privacyConfirmed: false });
  };

  const handlePrivacyNext = () => {
    updateState({ step: 'context' });
  };

  const handleContextNext = async () => {
    updateState({ step: 'analyzing', isLoading: true, error: null });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceBlocks: state.sourceBlocks,
          userContext: state.userContext,
          userRole: state.userRole,
          referenceDate: state.referenceDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      updateState({
        step: 'results',
        analysis: data.analysis,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      updateState({
        step: 'context',
        isLoading: false,
        error: err.message || 'Analysis failed',
      });
    }
  };

  const handleReset = () => {
    setState(initialState);
  };

  const handleBack = () => {
    const stepOrder: AppStep[] = ['welcome', 'input', 'review', 'privacy', 'context', 'analyzing', 'results'];
    const currentIndex = stepOrder.indexOf(state.step);
    if (currentIndex > 0) {
      updateState({ step: stepOrder[currentIndex - 1] });
    }
  };

  if (state.step === 'welcome') {
    return (
      <AppShell currentStep="welcome">
        <LandingView onStart={handleStart} />
      </AppShell>
    );
  }

  if (state.step === 'sample') {
    return (
      <AppShell currentStep="sample">
        <SampleWalkthrough />
      </AppShell>
    );
  }

  if (state.step === 'input') {
    return (
      <AppShell currentStep="welcome">
        <DocumentInputView
          setSourceBlocks={setSourceBlocks}
          setOriginalText={setOriginalText}
          setEditedText={setEditedText}
          onNext={handleInputNext}
          onSample={handleSample}
        />
      </AppShell>
    );
  }

  if (state.step === 'review') {
    return (
      <AppShell currentStep="welcome">
        <SourceReviewView
          sourceBlocks={state.sourceBlocks}
          editedText={state.editedText}
          setEditedText={setEditedText}
          onBack={handleBack}
          onNext={handleReviewNext}
        />
      </AppShell>
    );
  }

  if (state.step === 'privacy') {
    return (
      <AppShell currentStep="welcome">
        <PrivacyReviewView
          sourceBlocks={state.sourceBlocks}
          editedText={state.editedText}
          privacyConfirmed={state.privacyConfirmed}
          setPrivacyConfirmed={setPrivacyConfirmed}
          onBack={handleBack}
          onNext={handlePrivacyNext}
        />
      </AppShell>
    );
  }

  if (state.step === 'context') {
    return (
      <AppShell currentStep="welcome">
        <ContextInputView
          userContext={state.userContext}
          setUserContext={setUserContext}
          userRole={state.userRole}
          setUserRole={setUserRole}
          referenceDate={state.referenceDate}
          setReferenceDate={setReferenceDate}
          onBack={handleBack}
          onNext={handleContextNext}
        />
        {state.error && (
          <Callout variant="error" className="max-w-3xl mx-auto mt-4" title="Error">
            {state.error}
          </Callout>
        )}
      </AppShell>
    );
  }

  if (state.step === 'analyzing') {
    return (
      <AppShell currentStep="welcome">
        <AnalyzingView />
      </AppShell>
    );
  }

  if (state.step === 'results' && state.analysis) {
    return (
      <AppShell currentStep="welcome">
        <AnalysisWorkspace
          analysis={state.analysis}
          sourceBlocks={state.sourceBlocks}
          onReset={handleReset}
        />
      </AppShell>
    );
  }

  return (
    <AppShell currentStep="welcome">
      <LandingView onStart={handleStart} />
    </AppShell>
  );
}