import { describe, it, expect } from 'vitest';
import { verifyEvidence, attachEvidenceStatus, hasVerifiedEvidence, getEvidenceSummary } from '@/lib/analysis/validate-evidence';
import { SourceBlock, EvidenceReference, EvidenceStatus } from '@/types';

const sampleBlocks: SourceBlock[] = [
  {
    id: 'page-1',
    label: 'Page 1',
    page: 1,
    text: 'The application deadline is March 15, 2024. All materials must be received by this date.',
  },
  {
    id: 'page-2',
    label: 'Page 2',
    page: 2,
    text: 'You must submit an official transcript and two letters of recommendation.',
  },
];

describe('verifyEvidence', () => {
  it('verifies a quote that exists in the source block', () => {
    const evidence: EvidenceReference[] = [
      { blockId: 'page-1', quote: 'application deadline is March 15, 2024' },
    ];
    const result = verifyEvidence(evidence, sampleBlocks);
    expect(result[0].verified).toBe(true);
    expect(result[0].sourceLabel).toBe('Page 1');
    expect(result[0].page).toBe(1);
  });

  it('marks as unverified when block ID does not exist', () => {
    const evidence: EvidenceReference[] = [
      { blockId: 'page-99', quote: 'some quote' },
    ];
    const result = verifyEvidence(evidence, sampleBlocks);
    expect(result[0].verified).toBe(false);
    expect(result[0].sourceLabel).toContain('Unknown block');
  });

  it('marks as unverified when quote is not in the block', () => {
    const evidence: EvidenceReference[] = [
      { blockId: 'page-1', quote: 'this text does not exist in the source' },
    ];
    const result = verifyEvidence(evidence, sampleBlocks);
    expect(result[0].verified).toBe(false);
  });

  it('handles whitespace differences', () => {
    const evidence: EvidenceReference[] = [
      { blockId: 'page-1', quote: 'application deadline  is  March 15, 2024' },
    ];
    const result = verifyEvidence(evidence, sampleBlocks);
    expect(result[0].verified).toBe(true);
  });

  it('handles unicode normalization', () => {
    const blocksWithUnicode: SourceBlock[] = [
      { id: 'page-1', label: 'Page 1', page: 1, text: 'The deadline is March 15, 2024.' },
    ];
    const evidence: EvidenceReference[] = [
      { blockId: 'page-1', quote: 'The deadline is March 15, 2024.' },
    ];
    const result = verifyEvidence(evidence, blocksWithUnicode);
    expect(result[0].verified).toBe(true);
  });

  it('rejects empty quotes', () => {
    const evidence: EvidenceReference[] = [
      { blockId: 'page-1', quote: '' },
    ];
    const result = verifyEvidence(evidence, sampleBlocks);
    expect(result[0].verified).toBe(false);
  });
});

describe('attachEvidenceStatus', () => {
  it('attaches evidence status to findings', () => {
    const findings = [
      {
        id: 'finding-1',
        text: 'Test finding',
        evidence: [{ blockId: 'page-1', quote: 'application deadline is March 15, 2024' }],
      },
    ];
    const result = attachEvidenceStatus(findings, sampleBlocks);
    expect(result[0].evidenceStatus).toBeDefined();
    expect(result[0].evidenceStatus?.[0].verified).toBe(true);
  });
});

describe('hasVerifiedEvidence', () => {
  it('returns true when at least one evidence is verified', () => {
    const finding = {
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 1', page: 1 },
        { verified: false, sourceLabel: 'Page 2', page: 2 },
      ] as EvidenceStatus[],
    };
    expect(hasVerifiedEvidence(finding)).toBe(true);
  });

  it('returns false when no evidence is verified', () => {
    const finding = {
      evidenceStatus: [
        { verified: false, sourceLabel: 'Page 1', page: 1 },
      ] as EvidenceStatus[],
    };
    expect(hasVerifiedEvidence(finding)).toBe(false);
  });

  it('returns false when evidenceStatus is undefined', () => {
    const finding = {};
    expect(hasVerifiedEvidence(finding)).toBe(false);
  });
});

describe('getEvidenceSummary', () => {
  it('returns correct counts', () => {
    const finding = {
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 1', page: 1 },
        { verified: true, sourceLabel: 'Page 2', page: 2 },
        { verified: false, sourceLabel: 'Page 3', page: 3 },
      ] as EvidenceStatus[],
    };
    const summary = getEvidenceSummary(finding);
    expect(summary.verified).toBe(2);
    expect(summary.total).toBe(3);
  });

  it('returns zero for undefined', () => {
    const finding = {};
    const summary = getEvidenceSummary(finding);
    expect(summary.verified).toBe(0);
    expect(summary.total).toBe(0);
  });
});