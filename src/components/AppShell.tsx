'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { FileText, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  currentStep?: string;
}

export function AppShell({ children, currentStep }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="CivicClear AI Home">
            <svg className="w-6 h-6 text-[var(--color-forest)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <path d="M10 9h4" />
            </svg>
            <span className="text-xl font-semibold text-[var(--color-ink)]">CivicClear</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link href="/" className={cn('text-sm font-medium transition-colors', currentStep === 'welcome' ? 'text-[var(--color-forest)]' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]')}>
              Start
            </Link>
            <Link href="/sample" className={cn('text-sm font-medium transition-colors', currentStep === 'sample' ? 'text-[var(--color-forest)]' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]')}>
              Sample Walkthrough
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {children}
        </div>
      </main>
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-[var(--color-ink-light)]">
            CivicClear AI is an independent explanatory tool. It does not make official eligibility determinations,
            replace an advisor, or guarantee application acceptance. The issuing organization remains the authoritative source.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface StepIndicatorProps {
  steps: Array<{ id: string; label: string; complete?: boolean; current?: boolean }>;
  className?: string;
}

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <nav className={cn('flex items-center gap-4 overflow-x-auto pb-2', className)} aria-label="Progress steps">
      <ol className="flex items-center gap-2" role="list">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all',
                  step.complete
                    ? 'bg-[var(--color-forest)] text-white'
                    : step.current
                    ? 'bg-[var(--color-forest-pale)] text-[var(--color-forest)] border border-[var(--color-forest)]'
                    : 'bg-[var(--color-border)] text-[var(--color-ink-light)]'
                )}
                aria-current={step.current ? 'step' : undefined}
              >
                {step.complete ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn('hidden sm:block text-sm font-medium', step.current ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]')}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn('hidden sm:block w-16 h-0.5 mx-2', step.complete ? 'bg-[var(--color-forest)]' : 'bg-[var(--color-border)]')} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Section({ title, description, children, className, action }: SectionProps) {
  return (
    <section className={cn('animate-fade-in', className)} aria-labelledby={title.toLowerCase().replace(/\s+/g, '-')}>
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h2 id={title.toLowerCase().replace(/\s+/g, '-')} className="text-2xl font-semibold text-[var(--color-ink)]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-base text-[var(--color-ink-muted)]">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0 mt-2 sm:mt-0">{action}</div>}
      </header>
      <div>{children}</div>
    </section>
  );
}

interface CalloutProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({ variant = 'info', title, children, className }: CalloutProps) {
  const variantStyles = {
    info: 'bg-[var(--color-forest-pale)] border-[var(--color-forest)]',
    warning: 'bg-[var(--color-amber-pale)] border-[var(--color-amber)]',
    error: 'bg-[var(--color-error-pale)] border-[var(--color-error)]',
    success: 'bg-[var(--color-success-pale)] border-[var(--color-success)]',
  };

  const iconMap = {
    info: (
      <svg className="w-5 h-5 text-[var(--color-forest)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-[var(--color-amber)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-[var(--color-error)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  };

  return (
    <div className={cn('rounded-lg border p-4', variantStyles[variant], className)} role="alert">
      <div className="flex gap-3">
        {iconMap[variant]}
        <div className="flex-1">
          {title && <h4 className="font-medium text-[var(--color-ink)]">{title}</h4>}
          <div className={cn('mt-1', title ? 'text-sm' : '')}>{children}</div>
        </div>
      </div>
    </div>
  );
}

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Collapsible({ title, children, defaultOpen = false, className }: CollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <details className={cn('group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden', className)}>
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-pale)] focus-visible:ring-offset-2">
        <h3 className="font-medium text-[var(--color-ink)]">{title}</h3>
        <ChevronRight className={cn('w-5 h-5 text-[var(--color-ink-light)] transition-transform', open && 'rotate-90')} aria-hidden="true" />
      </summary>
      <div className={cn('border-t border-[var(--color-border)] p-4 animate-fade-in', !open && 'hidden')}>
        {children}
      </div>
    </details>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 md:py-16', className)}>
      {icon && <div className="mx-auto mb-4 text-[var(--color-ink-light)]">{icon}</div>}
      <h3 className="text-lg font-medium text-[var(--color-ink)]">{title}</h3>
      {description && <p className="mt-2 text-[var(--color-ink-muted)]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

import * as React from 'react';