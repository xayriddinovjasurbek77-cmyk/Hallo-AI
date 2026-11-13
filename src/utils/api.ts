import type { Language, TranslationSchema } from '../i18n/translations';

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 54000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiClientError('TIMEOUT', 504, 'Request timed out');
    }
    throw new ApiClientError('NETWORK_ERROR', 0, 'Network request failed');
  } finally {
    window.clearTimeout(timeoutId);
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    // non-json fallback
  }

  if (!response.ok) {
    const code = typeof data.code === 'string' ? data.code : 'UPSTREAM_ERROR';
    const message = typeof data.error === 'string' ? data.error : 'Server error';
    throw new ApiClientError(code, response.status, message);
  }

  return data as TResponse;
}

export function resolveLocalizedError(err: unknown, t: TranslationSchema['errors']): string {
  if (err instanceof ApiClientError) {
    if (err.code === 'NETWORK_ERROR') return t.network;
    if (err.code === 'TIMEOUT') return t.timeout;
    if (err.code === 'SERVICE_UNAVAILABLE') return t.serviceUnavailable;
    if (err.code === 'RATE_LIMIT') return t.rateLimit;
    if (err.code === 'API_KEY_ERROR') return t.apiKey;
    return t.server;
  }
  return t.unknown;
}

export type ToolId = 'assistant' | 'writer' | 'translator' | 'calculator' | 'planner';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface WriterResult {
  title: string;
  content: string;
  notes: string;
}

export interface TranslateResult {
  detectedLanguage: string;
  translation: string;
  nuance: string;
}

export interface PlannerAiResponse {
  items: Array<{ title: string; timeOrQuantity: string }>;
}

export type WriterMode = 'formal_letter' | 'application' | 'announcement' | 'rewrite';
export type WriterTone = 'formal' | 'polite' | 'concise';
export type SourceLanguageOption = 'auto' | Language;
