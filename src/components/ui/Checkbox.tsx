'use client';

import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <label className={cn('flex items-start gap-3 cursor-pointer', className)}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-forest)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-pale)] focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-150',
            className
          )}
          {...props}
        />
        <div className="flex flex-col">
          <span className="text-base text-[var(--color-ink)]">{label}</span>
          {description && (
            <span className="text-sm text-[var(--color-ink-light)]">{description}</span>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface CheckboxGroupProps {
  label: string;
  description?: string;
  options: Array<{ value: string; label: string; description?: string }>;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function CheckboxGroup({ label, description, options, name, value, onChange, ...props }: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);
    onChange(newValue);
  };

  return (
    <fieldset className="space-y-3" {...props}>
      <legend className="text-sm font-medium text-[var(--color-ink)]">{label}</legend>
      {description && <p className="text-sm text-[var(--color-ink-light)]">{description}</p>}
      <div className="space-y-2" role="group" aria-labelledby={`${name}-label`}>
        {options.map((option) => (
          <label key={option.value} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-forest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-pale)] focus-visible:ring-offset-2"
            />
            <div className="flex flex-col">
              <span className="text-base text-[var(--color-ink)]">{option.label}</span>
              {option.description && (
                <span className="text-sm text-[var(--color-ink-light)]">{option.description}</span>
              )}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}