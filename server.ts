import 'dotenv/config';
import http from 'http';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Lang = 'uz' | 'en' | 'ru';

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const UPSTREAM_TIMEOUT_MS = 11000;
const TOTAL_RESILIENCE_BUDGET_MS = 35000;
const DAILY_QUOTA_COOLDOWN_MS = 15 * 60 * 1000;
const TRANSIENT_COOLDOWN_MS = 30 * 1000;

const modelCooldownUntil = new Map<string, number>();

const LANG_NAMES: Record<Lang, string> = {
  uz: 'Uzbek (Latin script, natural modern literary Uzbek)',
  en: 'English',
  ru: 'Russian',
};

function isValidLang(value: unknown): value is Lang {
  return value === 'uz' || value === 'en' || value === 'ru';
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: UPSTREAM_TIMEOUT_MS,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getThinkingConfig(model: string) {
  return model === PRIMARY_MODEL ? { thinkingLevel: ThinkingLevel.LOW } : undefined;
}

function extractErrorDetails(err: unknown): { status?: number; message: string } {
  const message = err instanceof Error ? err.message : String(err);
  const candidate = err as { status?: unknown; statusCode?: unknown } | null;
  const rawStatus = candidate?.status ?? candidate?.statusCode;
  const status = typeof rawStatus === 'number' ? rawStatus : undefined;
  return { status, message };
}

function isQuotaOrRateError(err: unknown): { isQuota: boolean; isDailyLimit: boolean } {
  const { status, message } = extractErrorDetails(err);
  const lower = message.toLowerCase();
  const isQuota =
    status === 429 ||
    lower.includes('"code":429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota');
  const isDailyLimit =
    isQuota &&
    (lower.includes('perday') ||
      lower.includes('per day') ||
      lower.includes('generaterequestsperday') ||
      lower.includes('freetier'));
  return { isQuota, isDailyLimit };
}

function isTransientError(err: unknown): boolean {
  const { status, message } = extractErrorDetails(err);
  if (status && [408, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }
  const msg = message.toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('500') ||
    msg.includes('internal') ||
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('empty response from model')
  );
}

function getCooldownKey(model: string): string {
  const keyTag = (process.env.GEMINI_API_KEY ?? '').trim().slice(-8);
  return `${keyTag}:${model}`;
}

function isModelInCooldown(model: string): boolean {
  const until = modelCooldownUntil.get(getCooldownKey(model)) ?? 0;
  return Date.now() < until;
}

function markModelCooldown(model: string, durationMs: number): void {
  modelCooldownUntil.set(getCooldownKey(model), Date.now() + durationMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(
  runner: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      runner(controller.signal),
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('UPSTREAM_TIMEOUT'));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function runWithModelResilience<T>(
  operation: (model: string, signal: AbortSignal) => Promise<T>
): Promise<T> {
  const candidates = [PRIMARY_MODEL, FALLBACK_MODEL];
  const readyModels = candidates.filter((m) => !isModelInCooldown(m));

  // If PRIMARY is cooled down due to daily quota/rate limit, route straight to FALLBACK.
  // Build at most 3 attempts across non-quota-exhausted models within the 45s budget.
  const orderedBase = readyModels.length > 0 ? readyModels : [FALLBACK_MODEL, PRIMARY_MODEL];
  const attempts: Array<{ model: string; delayBeforeMs: number }> = [];
  for (let i = 0; i < orderedBase.length; i += 1) {
    attempts.push({ model: orderedBase[i], delayBeforeMs: i === 0 ? 0 : 250 });
  }
  const fallbackRetryModel = orderedBase[orderedBase.length - 1];
  attempts.push({ model: fallbackRetryModel, delayBeforeMs: 800 });

  const startedAt = Date.now();
  let lastError: unknown;
  const skippedDueToDailyQuota = new Set<string>();

  for (let i = 0; i < attempts.length; i += 1) {
    const attempt = attempts[i];
    if (skippedDueToDailyQuota.has(attempt.model)) {
      continue;
    }

    const remainingBeforeDelay = TOTAL_RESILIENCE_BUDGET_MS - (Date.now() - startedAt);
    if (remainingBeforeDelay <= 1500) {
      break;
    }
    if (attempt.delayBeforeMs > 0) {
      await sleep(Math.min(attempt.delayBeforeMs, remainingBeforeDelay - 1500));
    }
    const remaining = TOTAL_RESILIENCE_BUDGET_MS - (Date.now() - startedAt);
    if (remaining <= 1000) {
      break;
    }
    const attemptTimeout = Math.min(UPSTREAM_TIMEOUT_MS, remaining);
    try {
      return await withTimeout((signal) => operation(attempt.model, signal), attemptTimeout);
    } catch (err) {
      lastError = err;
      const { status, message } = extractErrorDetails(err);
      const msg = message.toLowerCase();
      if (
        msg.includes('api_key_invalid') ||
        msg.includes('permission_denied') ||
        msg.includes('api key not valid') ||
        status === 400 ||
        status === 401 ||
        status === 403 ||
        msg.includes('"code":400') ||
        msg.includes('"code":401') ||
        msg.includes('"code":403')
      ) {
        throw err;
      }

      const { isQuota, isDailyLimit } = isQuotaOrRateError(err);
      if (isDailyLimit) {
        markModelCooldown(attempt.model, DAILY_QUOTA_COOLDOWN_MS);
        skippedDueToDailyQuota.add(attempt.model);
      } else if (isQuota || isTransientError(err) || msg.includes('upstream_timeout')) {
        if (attempt.model === PRIMARY_MODEL) {
          markModelCooldown(attempt.model, TRANSIENT_COOLDOWN_MS);
        }
      } else if (status !== 404 && !msg.includes('404')) {
        throw err;
      }
    }
  }

  throw lastError;
}

function normalizeChatHistory(
  history: unknown
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(history)) return [];
  const filtered = history
    .filter(
      (m): m is { role: 'user' | 'model'; text: string } =>
        Boolean(m) &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'model') &&
        typeof m.text === 'string' &&
        m.text.trim().length > 0
    )
    .slice(-12);

  const normalized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const entry of filtered) {
    if (normalized.length === 0 && entry.role !== 'user') {
      continue;
    }
    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === entry.role) {
      prev.parts[0].text = `${prev.parts[0].text}\n\n${entry.text.trim()}`;
    } else {
      normalized.push({
        role: entry.role,
        parts: [{ text: entry.text.trim() }],
      });
    }
  }
  return normalized;
}

function parseJsonSafely<T>(rawText: string | undefined): T {
  const cleaned = (rawText ?? '{}')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned || '{}') as T;
}

function classifyGeminiError(err: unknown): { status: number; code: string; message: string } {
  const { status, message: msg } = extractErrorDetails(err);
  const lower = msg.toLowerCase();
  if (lower.includes('upstream_timeout') || status === 504) {
    return { status: 504, code: 'TIMEOUT', message: 'AI provider request timed out.' };
  }
  if (
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('api key not valid') ||
    status === 401 ||
    status === 403
  ) {
    return { status: 401, code: 'API_KEY_ERROR', message: msg };
  }
  if (lower.includes('resource_exhausted') || status === 429 || lower.includes('"code":429') || lower.includes('quota')) {
    return { status: 429, code: 'RATE_LIMIT', message: msg };
  }
  if (
    status === 503 ||
    lower.includes('"code":503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded')
  ) {
    return { status: 503, code: 'SERVICE_UNAVAILABLE', message: msg };
  }
  return { status: 502, code: 'UPSTREAM_ERROR', message: msg };
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: 'hallo',
      aiConfigured: Boolean(getGeminiClient()),
    });
  });

  // 1. Everyday AI Assistant
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    try {
      const { message, history, language } = req.body as {
        message?: string;
        history?: Array<{ role: 'user' | 'model'; text: string }>;
        language?: unknown;
      };

      const cleanMessage = typeof message === 'string' ? message.trim() : '';
      if (!cleanMessage) {
        res.status(400).json({ code: 'VALIDATION_ERROR', error: 'Message is required.' });
        return;
      }

      const lang: Lang = isValidLang(language) ? language : 'uz';
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({ code: 'API_KEY_ERROR', error: 'Gemini API key is not configured.' });
        return;
      }

      const safeHistory = normalizeChatHistory(history);

      const systemInstruction = `You are HALLO, a calm, thoughtful, practical everyday assistant.
Respond in ${LANG_NAMES[lang]} by default unless the user explicitly asks for content in another language.
Explain complex topics simply and clearly using everyday examples.
Provide structured, actionable recommendations without fluff, hype, or robotic phrasing.
Keep formatting clean using short paragraphs and numbered or bulleted points only when helpful.`;

      const reply = await runWithModelResilience(async (model, signal) => {
        const thinkingConfig = getThinkingConfig(model);
        const chat = ai.chats.create({
          model,
          history: safeHistory,
          config: {
            systemInstruction,
            abortSignal: signal,
            ...(thinkingConfig ? { thinkingConfig } : {}),
          },
        });

        const response = await chat.sendMessage({
          message: cleanMessage,
          config: { abortSignal: signal },
        });
        const text = response.text?.trim() ?? '';
        if (!text) {
          throw new Error('Empty response from model.');
        }
        return text;
      });

      res.json({ reply });
    } catch (err) {
      const mapped = classifyGeminiError(err);
      console.error('[HALLO AI /assistant error]', mapped.code, mapped.message);
      res.status(mapped.status).json({ code: mapped.code, error: mapped.message });
    }
  });

  // 2. Smart Text Writer
  app.post('/api/ai/writer', async (req: Request, res: Response) => {
    try {
      const { mode, tone, recipient, topic, language } = req.body as {
        mode?: string;
        tone?: string;
        recipient?: string;
        topic?: string;
        language?: unknown;
      };

      const cleanTopic = typeof topic === 'string' ? topic.trim() : '';
      if (!cleanTopic) {
        res.status(400).json({ code: 'VALIDATION_ERROR', error: 'Topic or draft text is required.' });
        return;
      }

      const lang: Lang = isValidLang(language) ? language : 'uz';
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({ code: 'API_KEY_ERROR', error: 'Gemini API key is not configured.' });
        return;
      }

      const modeDescriptions: Record<string, string> = {
        formal_letter: 'Write a complete, well-structured formal letter with appropriate salutation and closing.',
        application: 'Write an official application or formal request document (ariza / statement / request).',
        announcement: 'Write a clear, engaging public or team announcement / notice.',
        rewrite: 'Rewrite and polish the provided text so it reads naturally, clearly, and professionally while preserving meaning.',
      };

      const toneDescriptions: Record<string, string> = {
        formal: 'strictly formal and respectful',
        polite: 'warm, polite, and courteous',
        concise: 'direct, concise, and crisp',
      };

      const selectedMode = modeDescriptions[mode ?? ''] ?? modeDescriptions.formal_letter;
      const selectedTone = toneDescriptions[tone ?? ''] ?? toneDescriptions.polite;
      const recipientLine =
        typeof recipient === 'string' && recipient.trim() ? `Recipient: ${recipient.trim()}` : '';

      const parsed = await runWithModelResilience(async (model, signal) => {
        const thinkingConfig = getThinkingConfig(model);
        const response = await ai.models.generateContent({
          model,
          contents: `${selectedMode}
Tone: ${selectedTone}.
${recipientLine}
Input / Details: ${cleanTopic}`,
          config: {
            systemInstruction: `You are HALLO's editorial writing specialist.
Write the entire output—title, document content, and brief editorial note—exclusively in ${LANG_NAMES[lang]}.
Ensure the text is immediately usable, idiomatic, and free of placeholder jargon unless brackets like [Sana/Date] are strictly necessary for missing personal details.`,
            abortSignal: signal,
            ...(thinkingConfig ? { thinkingConfig } : {}),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: 'Concise document title or subject line in the target language.',
                },
                content: {
                  type: Type.STRING,
                  description: 'The complete, ready-to-use formatted text.',
                },
                notes: {
                  type: Type.STRING,
                  description: 'One short sentence explaining the structure or suggested adjustment.',
                },
              },
              required: ['title', 'content', 'notes'],
            },
          },
        });

        return parseJsonSafely<{ title?: string; content?: string; notes?: string }>(response.text);
      });

      res.json({
        title: parsed.title?.trim() ?? '',
        content: parsed.content?.trim() ?? '',
        notes: parsed.notes?.trim() ?? '',
      });
    } catch (err) {
      const mapped = classifyGeminiError(err);
      console.error('[HALLO AI /writer error]', mapped.code, mapped.message);
      res.status(mapped.status).json({ code: mapped.code, error: mapped.message });
    }
  });

  // 3. AI Translator
  app.post('/api/ai/translate', async (req: Request, res: Response) => {
    try {
      const { text, sourceLang, targetLang, uiLanguage } = req.body as {
        text?: string;
        sourceLang?: string;
        targetLang?: unknown;
        uiLanguage?: unknown;
      };

      const cleanText = typeof text === 'string' ? text.trim() : '';
      if (!cleanText) {
        res.status(400).json({ code: 'VALIDATION_ERROR', error: 'Text to translate is required.' });
        return;
      }

      const target: Lang = isValidLang(targetLang) ? targetLang : 'en';
      const uiLang: Lang = isValidLang(uiLanguage) ? uiLanguage : 'uz';
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({ code: 'API_KEY_ERROR', error: 'Gemini API key is not configured.' });
        return;
      }

      const sourceInstruction =
        sourceLang && isValidLang(sourceLang)
          ? `The source language is ${LANG_NAMES[sourceLang]}.`
          : 'Automatically detect the source language (Uzbek, English, Russian, or another language).';

      const parsed = await runWithModelResilience(async (model, signal) => {
        const thinkingConfig = getThinkingConfig(model);
        const response = await ai.models.generateContent({
          model,
          contents: `${sourceInstruction}
Translate the following text into ${LANG_NAMES[target]}:

"""
${cleanText}
"""`,
          config: {
            systemInstruction: `You are HALLO's professional literary and everyday translator specializing in Uzbek (Latin), English, and Russian.
Provide natural, culturally accurate translations rather than stiff word-for-word rendering.
Return detectedLanguage as one of "uz", "en", "ru", or the language name if different.
Write the brief nuance field in ${LANG_NAMES[uiLang]}.`,
            abortSignal: signal,
            ...(thinkingConfig ? { thinkingConfig } : {}),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedLanguage: {
                  type: Type.STRING,
                  description: 'Detected source language code ("uz", "en", "ru") or name.',
                },
                translation: {
                  type: Type.STRING,
                  description: 'The complete natural translation in the target language.',
                },
                nuance: {
                  type: Type.STRING,
                  description: 'One brief note on tone or phrasing in the UI language (or empty string if straightforward).',
                },
              },
              required: ['detectedLanguage', 'translation', 'nuance'],
            },
          },
        });

        return parseJsonSafely<{
          detectedLanguage?: string;
          translation?: string;
          nuance?: string;
        }>(response.text);
      });

      res.json({
        detectedLanguage: parsed.detectedLanguage?.trim() ?? 'auto',
        translation: parsed.translation?.trim() ?? '',
        nuance: parsed.nuance?.trim() ?? '',
      });
    } catch (err) {
      const mapped = classifyGeminiError(err);
      console.error('[HALLO AI /translate error]', mapped.code, mapped.message);
      res.status(mapped.status).json({ code: mapped.code, error: mapped.message });
    }
  });

  // 4. Smart Planner AI Generator
  app.post('/api/ai/planner', async (req: Request, res: Response) => {
    try {
      const { category, goal, language } = req.body as {
        category?: string;
        goal?: string;
        language?: unknown;
      };

      const cleanGoal = typeof goal === 'string' ? goal.trim() : '';
      if (!cleanGoal) {
        res.status(400).json({ code: 'VALIDATION_ERROR', error: 'Planning goal is required.' });
        return;
      }

      const lang: Lang = isValidLang(language) ? language : 'uz';
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({ code: 'API_KEY_ERROR', error: 'Gemini API key is not configured.' });
        return;
      }

      const categoryPrompt: Record<string, string> = {
        daily_plan: 'Create a practical, balanced daily plan with 5 to 7 clear steps.',
        tasks: 'Break the goal down into 5 to 7 concrete, actionable tasks.',
        shopping_list: 'Create an organized shopping list with realistic quantities for 6 to 10 items.',
        schedule: 'Create a realistic time-blocked schedule with specific time slots for 5 to 7 blocks.',
      };

      const promptDetail = categoryPrompt[category ?? ''] ?? categoryPrompt.daily_plan;

      const parsed = await runWithModelResilience(async (model, signal) => {
        const thinkingConfig = getThinkingConfig(model);
        const response = await ai.models.generateContent({
          model,
          contents: `${promptDetail}\nUser goal: ${cleanGoal}`,
          config: {
            systemInstruction: `You are HALLO's personal organization assistant.
Write every item title and timeOrQuantity label exclusively in ${LANG_NAMES[lang]}.
Keep each title concise (3-9 words) and timeOrQuantity short (e.g., "09:00 - 10:00", "2 kg", "15 min").`,
            abortSignal: signal,
            ...(thinkingConfig ? { thinkingConfig } : {}),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      timeOrQuantity: { type: Type.STRING },
                    },
                    required: ['title', 'timeOrQuantity'],
                  },
                },
              },
              required: ['items'],
            },
          },
        });

        return parseJsonSafely<{
          items?: Array<{ title?: string; timeOrQuantity?: string }>;
        }>(response.text);
      });

      const items = Array.isArray(parsed.items)
        ? parsed.items
            .filter((item) => item && typeof item.title === 'string' && item.title.trim())
            .map((item) => ({
              title: item.title!.trim(),
              timeOrQuantity: typeof item.timeOrQuantity === 'string' ? item.timeOrQuantity.trim() : '',
            }))
        : [];

      res.json({ items });
    } catch (err) {
      const mapped = classifyGeminiError(err);
      console.error('[HALLO AI /planner error]', mapped.code, mapped.message);
      res.status(mapped.status).json({ code: mapped.code, error: mapped.message });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`HALLO server running on http://0.0.0.0:${port}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start HALLO server:', err);
  process.exit(1);
});
