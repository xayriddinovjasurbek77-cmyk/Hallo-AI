import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RotateCcw, Copy, Check, AlertCircle, MessageSquare } from 'lucide-react';
import type { Language, TranslationSchema } from '../../i18n/translations';
import { postJson, resolveLocalizedError, type AssistantMessage } from '../../utils/api';

interface AssistantToolProps {
  language: Language;
  t: TranslationSchema['assistant'];
  errT: TranslationSchema['errors'];
}

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function AssistantTool({ language, t, errT }: AssistantToolProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages.length, loading]);

  const sendMessage = async (textOverride?: string) => {
    const query = (textOverride ?? input).trim();
    if (!query) {
      setError(t.validationEmpty);
      return;
    }

    setError(null);
    setLastPrompt(query);
    if (!textOverride) {
      setInput('');
    }

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const data = await postJson<{ reply: string }>('/api/ai/assistant', {
        message: query,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        language,
      });

      const assistantMsg: AssistantMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(resolveLocalizedError(err, errT));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-beige/60">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
            {t.title}
          </h3>
          <p className="mt-1 text-sm text-charcoal/75">{t.subtitle}</p>
        </div>

        {messages.length > 0 && (
          <motion.button
            type="button"
            onClick={handleClear}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-beige text-xs font-medium text-charcoal/80 hover:text-charcoal hover:bg-ivory/70 transition-colors cursor-pointer self-start whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clear}</span>
          </motion.button>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="min-h-[300px] max-h-[440px] overflow-y-auto pr-1 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && !loading && (
            <motion.div
              key="assistant-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
              className="py-4 space-y-5"
            >
              <div className="flex items-start gap-3 text-charcoal/80">
                <MessageSquare className="w-5 h-5 mt-0.5 text-olive shrink-0" />
                <div>
                  <p className="text-base font-medium text-charcoal">{t.emptyTitle}</p>
                  <p className="text-sm text-charcoal/70 mt-0.5">{t.emptySubtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.suggestions.map((suggestion, idx) => (
                  <motion.button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05, ease: EASE_EDITORIAL }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className="text-left p-4 rounded-xl bg-ivory/70 border border-beige/70 hover:border-taupe hover:bg-ivory transition-colors text-sm text-charcoal/85 leading-relaxed cursor-pointer"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: EASE_EDITORIAL }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 ${
                    isUser
                      ? 'bg-charcoal text-pure'
                      : 'bg-ivory/80 border border-beige/80 text-charcoal'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5">
                    <span
                      className={`text-[11px] font-semibold tracking-wide ${
                        isUser ? 'text-beige' : 'text-olive'
                      }`}
                    >
                      {isUser ? t.userLabel : t.assistantLabel}
                    </span>

                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-taupe hover:text-charcoal transition-colors cursor-pointer"
                        aria-label={t.copy}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-olive" />
                            <span>{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.copy}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <motion.div
              key="assistant-typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start"
            >
              <div className="rounded-2xl px-4 py-3 bg-ivory/80 border border-beige/80 flex items-center gap-3">
                <span className="text-xs font-medium text-charcoal/75">{t.typingLabel}</span>
                <span className="inline-flex items-center gap-1" aria-hidden="true">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full bg-olive"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: dot * 0.16,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Inline Validation / API Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-ivory-deep border border-taupe/70 text-sm text-charcoal"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-charcoal shrink-0" />
              <span>{error}</span>
            </div>
            {lastPrompt && !loading && (
              <button
                type="button"
                onClick={() => sendMessage(lastPrompt)}
                className="text-xs font-semibold underline underline-offset-4 text-olive hover:text-charcoal cursor-pointer"
              >
                {t.retry}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
        className="pt-2 border-t border-beige/60 space-y-2"
      >
        <label htmlFor="assistant-input" className="block text-xs font-medium text-charcoal/75">
          {t.inputLabel}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="assistant-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t.placeholder}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm text-charcoal placeholder:text-taupe transition-colors min-h-[46px]"
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-charcoal text-pure text-sm font-medium hover:bg-charcoal/90 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[46px]"
          >
            <span>{loading ? t.sending : t.send}</span>
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
