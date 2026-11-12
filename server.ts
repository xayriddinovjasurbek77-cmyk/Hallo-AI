import 'dotenv/config';
import http from 'http';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Lang = 'uz' | 'en' | 'ru';

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
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function classifyGeminiError(err: unknown): { status: number; code: string; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('api key not valid') ||
    lower.includes('403')
  ) {
    return { status: 401, code: 'API_KEY_ERROR', message: msg };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return { status: 429, code: 'RATE_LIMIT', message: msg };
  }
  return { status: 502, code: 'UPSTREAM_ERROR', message: msg };
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'hallo' });
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

      const safeHistory = Array.isArray(history)
        ? history
            .filter(
              (m) =>
                m &&
                (m.role === 'user' || m.role === 'model') &&
                typeof m.text === 'string' &&
                m.text.trim().length > 0
            )
            .slice(-12)
            .map((m) => ({
              role: m.role,
              parts: [{ text: m.text.trim() }],
            }))
        : [];

      const systemInstruction = `You are HALLO, a calm, thoughtful, practical everyday assistant.
Respond in ${LANG_NAMES[lang]} by default unless the user explicitly asks for content in another language.
Explain complex topics simply and clearly using everyday examples.
Provide structured, actionable recommendations without fluff, hype, or robotic phrasing.
Keep formatting clean using short paragraphs and numbered or bulleted points only when helpful.`;

      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        history: safeHistory,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const response = await chat.sendMessage({ message: cleanMessage });
      const reply = response.text?.trim() ?? '';
      if (!reply) {
        res.status(502).json({ code: 'UPSTREAM_ERROR', error: 'Empty response from model.' });
        return;
      }

      res.json({ reply });
    } catch (err) {
      const mapped = classifyGeminiError(err);
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

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${selectedMode}
Tone: ${selectedTone}.
${recipientLine}
Input / Details: ${cleanTopic}`,
        config: {
          systemInstruction: `You are HALLO's editorial writing specialist.
Write the entire output—title, document content, and brief editorial note—exclusively in ${LANG_NAMES[lang]}.
Ensure the text is immediately usable, idiomatic, and free of placeholder jargon unless brackets like [Sana/Date] are strictly necessary for missing personal details.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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

      const raw = response.text?.trim() ?? '{}';
      const parsed = JSON.parse(raw) as { title?: string; content?: string; notes?: string };
      res.json({
        title: parsed.title?.trim() ?? '',
        content: parsed.content?.trim() ?? '',
        notes: parsed.notes?.trim() ?? '',
      });
    } catch (err) {
      const mapped = classifyGeminiError(err);
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

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
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
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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

      const raw = response.text?.trim() ?? '{}';
      const parsed = JSON.parse(raw) as {
        detectedLanguage?: string;
        translation?: string;
        nuance?: string;
      };

      res.json({
        detectedLanguage: parsed.detectedLanguage?.trim() ?? 'auto',
        translation: parsed.translation?.trim() ?? '',
        nuance: parsed.nuance?.trim() ?? '',
      });
    } catch (err) {
      const mapped = classifyGeminiError(err);
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

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${promptDetail}\nUser goal: ${cleanGoal}`,
        config: {
          systemInstruction: `You are HALLO's personal organization assistant.
Write every item title and timeOrQuantity label exclusively in ${LANG_NAMES[lang]}.
Keep each title concise (3-9 words) and timeOrQuantity short (e.g., "09:00 - 10:00", "2 kg", "15 min").`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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

      const raw = response.text?.trim() ?? '{}';
      const parsed = JSON.parse(raw) as {
        items?: Array<{ title?: string; timeOrQuantity?: string }>;
      };

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
