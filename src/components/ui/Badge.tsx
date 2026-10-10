'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'amber' | 'error' | 'success' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-[var(--color-forest-pale)] text-[var(--color-forest)]',
      amber: 'bg-[var(--color-amber-pale)] text-[var(--color-amber)]',
      error: 'bg-[var(--color-error-pale)] text-[var(--color-error)]',
      success: 'bg-[var(--color-success-pale)] text-[var(--color-success)]',
      neutral: 'bg-[var(--color-border)] text-[var(--color-ink-muted)]',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';