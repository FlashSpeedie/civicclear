export interface ParsedDate {
  original: string;
  normalized: string | null;
  type: 'deadline' | 'event' | 'effective' | 'payment' | 'other';
  needsConfirmation: boolean;
  explanation: string;
}

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

export function parseDatePhrase(phrase: string, referenceDate?: string): ParsedDate {
  const lower = phrase.toLowerCase().trim();

  // Check for relative deadlines (e.g., "within 14 days", "30 days from receipt")
  const relativeMatch = lower.match(/(?:within|in|after)\s+(\d+)\s*(day|week|month)s?/i);
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();
    let ms = amount * 24 * 60 * 60 * 1000;
    if (unit.startsWith('week')) ms *= 7;
    if (unit.startsWith('month')) ms *= 30;

    if (referenceDate) {
      const ref = new Date(referenceDate);
      if (!isNaN(ref.getTime())) {
        const calculated = new Date(ref.getTime() + ms);
        return {
          original: phrase,
          normalized: calculated.toISOString().split('T')[0],
          type: 'deadline',
          needsConfirmation: false,
          explanation: `Calculated from reference date ${referenceDate} + ${amount} ${unit}(s)`,
        };
      }
    }

    return {
      original: phrase,
      normalized: null,
      type: 'deadline',
      needsConfirmation: true,
      explanation: `Relative deadline (${amount} ${unit}(s)) but no reference date provided`,
    };
  }

  // Check for explicit date patterns
  // MM/DD/YYYY or MM/DD/YY
  const usDateMatch = phrase.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  if (usDateMatch) {
    const month = parseInt(usDateMatch[1], 10) - 1;
    const day = parseInt(usDateMatch[2], 10);
    let year = parseInt(usDateMatch[3], 10);
    if (year < 100) year += 2000;
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return {
        original: phrase,
        normalized: date.toISOString().split('T')[0],
        type: 'deadline',
        needsConfirmation: false,
        explanation: 'Parsed as MM/DD/YYYY',
      };
    }
  }

  // YYYY-MM-DD
  const isoMatch = phrase.match(/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return {
        original: phrase,
        normalized: date.toISOString().split('T')[0],
        type: 'deadline',
        needsConfirmation: false,
        explanation: 'Parsed as YYYY-MM-DD',
      };
    }
  }

  // Month name formats: "January 15, 2024" or "15 January 2024"
  const monthNameMatch = phrase.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})\b/i);
  if (monthNameMatch) {
    const month = MONTH_MAP[monthNameMatch[1].toLowerCase()];
    const day = parseInt(monthNameMatch[2], 10);
    const year = parseInt(monthNameMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return {
        original: phrase,
        normalized: date.toISOString().split('T')[0],
        type: 'deadline',
        needsConfirmation: false,
        explanation: 'Parsed as Month DD, YYYY',
      };
    }
  }

  const dayMonthYearMatch = phrase.match(/\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
  if (dayMonthYearMatch) {
    const day = parseInt(dayMonthYearMatch[1], 10);
    const month = MONTH_MAP[dayMonthYearMatch[2].toLowerCase()];
    const year = parseInt(dayMonthYearMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return {
        original: phrase,
        normalized: date.toISOString().split('T')[0],
        type: 'deadline',
        needsConfirmation: false,
        explanation: 'Parsed as DD Month YYYY',
      };
    }
  }

  // Check for "by [date]" or "due [date]" patterns
  const dueMatch = phrase.match(/\b(?:by|due|before|on|at)\s+(.+)/i);
  if (dueMatch) {
    return parseDatePhrase(dueMatch[1].trim(), referenceDate);
  }

  // Could not parse
  return {
    original: phrase,
    normalized: null,
    type: 'other',
    needsConfirmation: true,
    explanation: 'Could not parse as a specific calendar date',
  };
}

export function determineDateType(phrase: string, context: string): 'deadline' | 'event' | 'effective' | 'payment' | 'other' {
  const lower = phrase.toLowerCase();
  const ctxLower = context.toLowerCase();

  if (/\b(deadline|due|submit by|must be received by|cutoff|last day)\b/i.test(lower) || /\b(deadline|due|submit by|must be received by|cutoff|last day)\b/i.test(ctxLower)) {
    return 'deadline';
  }
  if (/\b(event|ceremony|meeting|orientation|session|workshop|interview)\b/i.test(lower) || /\b(event|ceremony|meeting|orientation|session|workshop|interview)\b/i.test(ctxLower)) {
    return 'event';
  }
  if (/\b(effective|takes effect|begins|starts|commences)\b/i.test(lower)) {
    return 'effective';
  }
  if (/\b(payment|pay|fee|tuition|deposit|installment)\b/i.test(lower)) {
    return 'payment';
  }
  return 'other';
}