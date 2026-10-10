import { describe, it, expect } from 'vitest';
import { scanForPrivacyConcerns, redactText, getFlagLabel } from '@/lib/privacy/local-scan';
import { SourceBlock } from '@/types';

const sampleBlocks: SourceBlock[] = [
  { id: 'page-1', label: 'Page 1', page: 1, text: 'Contact me at john.doe@example.com or call 555-123-4567.' },
  { id: 'page-2', label: 'Page 2', page: 2, text: 'My SSN is 123-45-6789 and my card number is 4111 1111 1111 1111.' },
  { id: 'page-3', label: 'Page 3', page: 3, text: 'API key: sk_test_abcdefghijklmnopqrstuvwxyz123456' },
];

describe('scanForPrivacyConcerns', () => {
  it('detects email addresses', () => {
    const result = scanForPrivacyConcerns(sampleBlocks);
    const emails = result.flagged.filter((f) => f.type === 'email');
    expect(emails.length).toBeGreaterThanOrEqual(1);
    expect(emails[0].text).toContain('@');
  });

  it('detects phone numbers', () => {
    const result = scanForPrivacyConcerns(sampleBlocks);
    const phones = result.flagged.filter((f) => f.type === 'phone');
    expect(phones.length).toBeGreaterThanOrEqual(1);
  });

  it('detects SSN-like patterns', () => {
    const result = scanForPrivacyConcerns(sampleBlocks);
    const ssns = result.flagged.filter((f) => f.type === 'ssn');
    expect(ssns.length).toBeGreaterThanOrEqual(1);
  });

  it('detects card-like number sequences', () => {
    const result = scanForPrivacyConcerns(sampleBlocks);
    const cards = result.flagged.filter((f) => f.type === 'card');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('detects possible API keys/secrets', () => {
    const result = scanForPrivacyConcerns(sampleBlocks);
    const secrets = result.flagged.filter((f) => f.type === 'secret');
    expect(secrets.length).toBeGreaterThanOrEqual(1);
  });

  it('includes block ID and position info', () => {
    const result = scanForPrivacyConcerns(sampleBlocks);
    for (const flag of result.flagged) {
      expect(flag.blockId).toBeDefined();
      expect(flag.startIndex).toBeGreaterThanOrEqual(0);
      expect(flag.endIndex).toBeGreaterThan(flag.startIndex);
    }
  });

  it('returns message about findings', () => {
    const result = scanForPrivacyConcerns(sampleBlocks);
    expect(result.message).toContain('potential sensitive item');
  });

  it('returns no findings for clean text', () => {
    const cleanBlocks: SourceBlock[] = [
      { id: 'page-1', label: 'Page 1', page: 1, text: 'This is a clean document with no sensitive info.' },
    ];
    const result = scanForPrivacyConcerns(cleanBlocks);
    expect(result.flagged.length).toBe(0);
    expect(result.message).toContain('No obvious sensitive patterns');
  });
});

describe('redactText', () => {
  it('redacts flagged content in text', () => {
    // "Contact me at " = 14 chars (indices 0-13), email starts at 14
    const text = 'Contact me at john.doe@example.com for details.';
    const flags = [
      { type: 'email' as const, text: 'john.doe@example.com', blockId: 'page-1', startIndex: 14, endIndex: 34 },
    ];
    const result = redactText(text, flags, 'page-1');
    expect(result).toBe('Contact me at [REDACTED] for details.');
  });

  it('handles multiple flags in same block', () => {
    // "Email: " = 7, email = 16 (7-22), " Phone: " = 8 (23-30), phone = 12 (31-42)
    const text = 'Email: john@example.com Phone: 555-123-4567';
    const flags = [
      { type: 'email' as const, text: 'john@example.com', blockId: 'page-1', startIndex: 7, endIndex: 23 },
      { type: 'phone' as const, text: '555-123-4567', blockId: 'page-1', startIndex: 31, endIndex: 43 },
    ];
    const result = redactText(text, flags, 'page-1');
    expect(result).toBe('Email: [REDACTED] Phone: [REDACTED]');
  });

  it('does not redact flags from other blocks', () => {
    const text = 'Page 1 text with john@example.com';
    const flags = [
      { type: 'email' as const, text: 'john@example.com', blockId: 'page-2', startIndex: 0, endIndex: 16 },
    ];
    const result = redactText(text, flags, 'page-1');
    expect(result).toBe(text);
  });
});

describe('getFlagLabel', () => {
  it('returns correct labels for each type', () => {
    expect(getFlagLabel('email')).toBe('Email address');
    expect(getFlagLabel('phone')).toBe('Phone number');
    expect(getFlagLabel('ssn')).toBe('SSN-like pattern');
    expect(getFlagLabel('card')).toBe('Card-like number');
    expect(getFlagLabel('secret')).toBe('Possible secret');
  });
});