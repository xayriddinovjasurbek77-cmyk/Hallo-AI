export type PercentageMode = 'percent_of' | 'what_percent' | 'percent_change';

export interface PercentageResult {
  ok: boolean;
  value?: number;
  formula?: string;
  errorCode?: 'INVALID_NUMBER' | 'DIVISION_BY_ZERO';
}

export interface DiscountResult {
  ok: boolean;
  originalPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  priceAfterDiscount?: number;
  taxPercent?: number;
  taxAmount?: number;
  finalPrice?: number;
  errorCode?: 'INVALID_NUMBER' | 'NEGATIVE_VALUE' | 'INVALID_PERCENT';
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
}

export interface ExpenseSummary {
  ok: boolean;
  total: number;
  count: number;
  average: number;
  perPerson: number;
  splitCount: number;
  errorCode?: 'INVALID_SPLIT_COUNT';
}

export interface MathEvalResult {
  ok: boolean;
  value?: number;
  formatted?: string;
  errorCode?: 'EMPTY_EXPRESSION' | 'INVALID_CHARACTER' | 'DIVISION_BY_ZERO' | 'SYNTAX_ERROR';
}

export function roundSmart(num: number, decimals = 4): number {
  if (!Number.isFinite(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

export function formatNumber(num: number, locale = 'en-US'): string {
  if (!Number.isFinite(num)) return '0';
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 4,
  }).format(roundSmart(num, 4));
}

export function calculatePercentage(
  mode: PercentageMode,
  a: number,
  b: number
): PercentageResult {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { ok: false, errorCode: 'INVALID_NUMBER' };
  }

  if (mode === 'percent_of') {
    const val = roundSmart((a / 100) * b);
    return { ok: true, value: val, formula: `${a}% × ${b} = ${val}` };
  }

  if (mode === 'what_percent') {
    if (b === 0) return { ok: false, errorCode: 'DIVISION_BY_ZERO' };
    const val = roundSmart((a / b) * 100);
    return { ok: true, value: val, formula: `(${a} ÷ ${b}) × 100 = ${val}%` };
  }

  // percent_change: from a to b
  if (a === 0) return { ok: false, errorCode: 'DIVISION_BY_ZERO' };
  const val = roundSmart(((b - a) / Math.abs(a)) * 100);
  return { ok: true, value: val, formula: `((${b} - ${a}) ÷ |${a}|) × 100 = ${val}%` };
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number,
  taxPercent = 0
): DiscountResult {
  if (!Number.isFinite(originalPrice) || !Number.isFinite(discountPercent) || !Number.isFinite(taxPercent)) {
    return { ok: false, errorCode: 'INVALID_NUMBER' };
  }
  if (originalPrice < 0) {
    return { ok: false, errorCode: 'NEGATIVE_VALUE' };
  }
  if (discountPercent < 0 || discountPercent > 100 || taxPercent < 0 || taxPercent > 100) {
    return { ok: false, errorCode: 'INVALID_PERCENT' };
  }

  const discountAmount = roundSmart((originalPrice * discountPercent) / 100);
  const priceAfterDiscount = roundSmart(originalPrice - discountAmount);
  const taxAmount = roundSmart((priceAfterDiscount * taxPercent) / 100);
  const finalPrice = roundSmart(priceAfterDiscount + taxAmount);

  return {
    ok: true,
    originalPrice: roundSmart(originalPrice),
    discountPercent: roundSmart(discountPercent),
    discountAmount,
    priceAfterDiscount,
    taxPercent: roundSmart(taxPercent),
    taxAmount,
    finalPrice,
  };
}

export function calculateExpenses(items: ExpenseItem[], splitCount: number): ExpenseSummary {
  if (!Number.isFinite(splitCount) || splitCount < 1 || !Number.isInteger(splitCount)) {
    return {
      ok: false,
      total: 0,
      count: items.length,
      average: 0,
      perPerson: 0,
      splitCount: 1,
      errorCode: 'INVALID_SPLIT_COUNT',
    };
  }

  const total = roundSmart(
    items.reduce((sum, item) => sum + (Number.isFinite(item.amount) && item.amount >= 0 ? item.amount : 0), 0)
  );
  const count = items.length;
  const average = count > 0 ? roundSmart(total / count) : 0;
  const perPerson = roundSmart(total / splitCount);

  return {
    ok: true,
    total,
    count,
    average,
    perPerson,
    splitCount,
  };
}

/**
 * Safe recursive-descent arithmetic parser.
 * Supports +, -, *, /, %, parentheses, decimals, and unary +/-.
 */
export function evaluateMathExpression(raw: string): MathEvalResult {
  const input = raw.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  if (!input) {
    return { ok: false, errorCode: 'EMPTY_EXPRESSION' };
  }
  if (!/^[0-9+\-*/().%]+$/.test(input)) {
    return { ok: false, errorCode: 'INVALID_CHARACTER' };
  }

  let pos = 0;

  function peek(): string {
    return input[pos] ?? '';
  }

  function consume(): string {
    const ch = input[pos] ?? '';
    pos += 1;
    return ch;
  }

  function parseExpression(): number {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = consume();
      const right = parseFactor();
      if (op === '*') {
        left = left * right;
      } else if (op === '/') {
        if (right === 0) throw new Error('DIVISION_BY_ZERO');
        left = left / right;
      } else {
        if (right === 0) throw new Error('DIVISION_BY_ZERO');
        left = left % right;
      }
    }
    return left;
  }

  function parseFactor(): number {
    const ch = peek();
    if (ch === '+') {
      consume();
      return parseFactor();
    }
    if (ch === '-') {
      consume();
      return -parseFactor();
    }
    if (ch === '(') {
      consume();
      const val = parseExpression();
      if (consume() !== ')') {
        throw new Error('SYNTAX_ERROR');
      }
      return val;
    }
    return parseNumber();
  }

  function parseNumber(): number {
    const start = pos;
    let seenDigit = false;
    let seenDot = false;
    while (pos < input.length) {
      const ch = peek();
      if (ch >= '0' && ch <= '9') {
        seenDigit = true;
        consume();
      } else if (ch === '.' && !seenDot) {
        seenDot = true;
        consume();
      } else {
        break;
      }
    }
    if (!seenDigit || pos === start) {
      throw new Error('SYNTAX_ERROR');
    }
    const parsed = Number(input.slice(start, pos));
    if (!Number.isFinite(parsed)) {
      throw new Error('SYNTAX_ERROR');
    }
    return parsed;
  }

  try {
    const result = parseExpression();
    if (pos !== input.length || !Number.isFinite(result)) {
      return { ok: false, errorCode: 'SYNTAX_ERROR' };
    }
    const rounded = roundSmart(result, 8);
    return {
      ok: true,
      value: rounded,
      formatted: String(rounded),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'DIVISION_BY_ZERO') {
      return { ok: false, errorCode: 'DIVISION_BY_ZERO' };
    }
    return { ok: false, errorCode: 'SYNTAX_ERROR' };
  }
}
