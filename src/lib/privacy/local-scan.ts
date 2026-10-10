export interface PrivacyFlag {
  type: 'email' | 'phone' | 'ssn' | 'card' | 'secret';
  text: string;
  blockId: string;
  startIndex: number;
  endIndex: number;
}

export interface PrivacyScanResult {
  flagged: PrivacyFlag[];
  message: string;
}

const patterns: Array<{ type: PrivacyFlag['type']; regex: RegExp; label: string }> = [
  {
    type: 'email',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    label: 'Email address',
  },
  {
    type: 'phone',
    regex: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    label: 'Phone number',
  },
  {
    type: 'ssn',
    regex: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    label: 'SSN-like pattern',
  },
  {
    type: 'card',
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    label: 'Card-like number sequence',
  },
  {
    type: 'secret',
    regex: /\b(?:api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|bearer[_-]?token|password|sk_test|sk_live)[\s:=]*[A-Za-z0-9_\-]{20,}\b/gi,
    label: 'Possible API key or secret',
  },
];

export function scanForPrivacyConcerns(blocks: Array<{ id: string; text: string }>): PrivacyScanResult {
  const flagged: PrivacyFlag[] = [];

  for (const block of blocks) {
    for (const { type, regex, label } of patterns) {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(block.text)) !== null) {
        flagged.push({
          type,
          text: match[0],
          blockId: block.id,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }

  const message = flagged.length > 0
    ? `Found ${flagged.length} potential sensitive item${flagged.length > 1 ? 's' : ''}. Review and redact if needed.`
    : 'No obvious sensitive patterns detected. This scan is not exhaustive.';

  return { flagged, message };
}

export function redactText(text: string, flags: PrivacyFlag[], blockId: string): string {
  const blockFlags = flags
    .filter((f) => f.blockId === blockId)
    .sort((a, b) => a.startIndex - b.startIndex);
  
  if (blockFlags.length === 0) return text;

  const parts: string[] = [];
  let lastEnd = 0;

  for (const flag of blockFlags) {
    parts.push(text.slice(lastEnd, flag.startIndex));
    parts.push('[REDACTED]');
    lastEnd = flag.endIndex;
  }

  parts.push(text.slice(lastEnd));
  return parts.join('');
}

export function getFlagLabel(type: PrivacyFlag['type']): string {
  const labels: Record<PrivacyFlag['type'], string> = {
    email: 'Email address',
    phone: 'Phone number',
    ssn: 'SSN-like pattern',
    card: 'Card-like number',
    secret: 'Possible secret',
  };
  return labels[type];
}