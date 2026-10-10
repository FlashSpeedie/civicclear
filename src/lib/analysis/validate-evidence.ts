import { SourceBlock, EvidenceReference, EvidenceStatus } from '@/types';

function normalizeForComparison(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function findQuoteInBlock(blockText: string, quote: string): { found: boolean; startIndex: number; endIndex: number } | null {
  const normalizedBlock = normalizeForComparison(blockText);
  const normalizedQuote = normalizeForComparison(quote);

  if (!normalizedQuote) return null;

  const index = normalizedBlock.indexOf(normalizedQuote);
  if (index === -1) return null;

  return {
    found: true,
    startIndex: index,
    endIndex: index + normalizedQuote.length,
  };
}

export function verifyEvidence(
  evidence: EvidenceReference[],
  sourceBlocks: SourceBlock[]
): EvidenceStatus[] {
  const blockMap = new Map(sourceBlocks.map((b) => [b.id, b]));

  return evidence.map((ref) => {
    const block = blockMap.get(ref.blockId);
    if (!block) {
      return {
        verified: false,
        sourceLabel: `Unknown block: ${ref.blockId}`,
        page: null,
      };
    }

    const match = findQuoteInBlock(block.text, ref.quote);
    if (!match || !match.found) {
      return {
        verified: false,
        sourceLabel: block.label,
        page: block.page,
      };
    }

    return {
      verified: true,
      sourceLabel: block.label,
      page: block.page,
    };
  });
}

export function attachEvidenceStatus<T extends { evidence: EvidenceReference[] }>(
  findings: T[],
  sourceBlocks: SourceBlock[]
): (T & { evidenceStatus: EvidenceStatus[] })[] {
  return findings.map((finding) => ({
    ...finding,
    evidenceStatus: verifyEvidence(finding.evidence, sourceBlocks),
  }));
}

export function filterVerifiedEvidence<T extends { evidenceStatus?: EvidenceStatus[] }>(
  findings: T[]
): T[] {
  return findings.map((finding) => {
    if (!finding.evidenceStatus) return finding;
    const verifiedStatus = finding.evidenceStatus.filter((s) => s.verified);
    return {
      ...finding,
      evidenceStatus: verifiedStatus,
    } as T;
  });
}

export function hasVerifiedEvidence(finding: { evidenceStatus?: EvidenceStatus[] }): boolean {
  return finding.evidenceStatus?.some((s) => s.verified) ?? false;
}

export function getEvidenceSummary(finding: { evidenceStatus?: EvidenceStatus[] }): { verified: number; total: number } {
  if (!finding.evidenceStatus) return { verified: 0, total: 0 };
  const verified = finding.evidenceStatus.filter((s) => s.verified).length;
  return { verified, total: finding.evidenceStatus.length };
}