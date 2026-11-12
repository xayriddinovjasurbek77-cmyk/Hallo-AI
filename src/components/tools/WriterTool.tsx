import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';
import type { Language, TranslationSchema } from '../../i18n/translations';
import {
  postJson,
  resolveLocalizedError,
  type WriterMode,
  type WriterResult,
  type WriterTone,
} from '../../utils/api';

interface WriterToolProps {
  language: Language;
  t: TranslationSchema['writer'];
  errT: TranslationSchema['errors'];
}

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function WriterTool({ language, t, errT }: WriterToolProps) {
  const [mode, setMode] = useState<WriterMode>('formal_letter');
  const [tone, setTone] = useState<WriterTone>('formal');
  const [recipient, setRecipient] = useState('');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<WriterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const modes: WriterMode[] = ['formal_letter', 'application', 'announcement', 'rewrite'];
  const tones: WriterTone[] = ['formal', 'polite', 'concise'];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError(t.validationEmpty);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await postJson<WriterResult>('/api/ai/writer', {
        mode,
        tone,
        recipient: recipient.trim(),
        topic: topic.trim(),
        language,
      });
      setResult(data);
    } catch (err) {
      setError(resolveLocalizedError(err, errT));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.content) return;
    const textToCopy = result.title ? `${result.title}\n\n${result.content}` : result.content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setTopic('');
    setRecipient('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-beige/60">
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
          {t.title}
        </h3>
        <p className="mt-1 text-sm text-charcoal/75">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Form Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleGenerate();
          }}
          className="lg:col-span-6 space-y-4"
        >
          {/* Mode selector */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-charcoal/75">{t.modeLabel}</span>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={active}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer min-h-[42px] border ${
                      active
                        ? 'bg-charcoal text-pure border-charcoal'
                        : 'bg-ivory/60 text-charcoal/80 border-beige/80 hover:border-taupe'
                    }`}
                  >
                    {t.modes[m]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone selector */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-charcoal/75">{t.toneLabel}</span>
            <div className="inline-flex flex-wrap gap-2">
              {tones.map((item) => {
                const active = tone === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTone(item)}
                    aria-pressed={active}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap min-h-[38px] border ${
                      active
                        ? 'bg-olive text-pure border-olive'
                        : 'bg-pure text-charcoal/80 border-beige hover:border-taupe'
                    }`}
                  >
                    {t.tones[item]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient (hidden in rewrite mode) */}
          {mode !== 'rewrite' && (
            <div className="space-y-1.5">
              <label htmlFor="writer-recipient" className="block text-xs font-medium text-charcoal/75">
                {t.recipientLabel}
              </label>
              <input
                id="writer-recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t.recipientPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm text-charcoal placeholder:text-taupe transition-colors min-h-[44px]"
              />
            </div>
          )}

          {/* Brief / Draft Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="writer-topic" className="block text-xs font-medium text-charcoal/75">
                {t.topicLabel}
              </label>
              <button
                type="button"
                onClick={() => {
                  setTopic(t.sampleTopics[mode]);
                  setError(null);
                }}
                className="text-xs font-medium text-olive hover:text-charcoal underline underline-offset-4 cursor-pointer"
              >
                {t.loadExample}
              </button>
            </div>
            <textarea
              id="writer-topic"
              rows={5}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              placeholder={mode === 'rewrite' ? t.rewritePlaceholder : t.topicPlaceholder}
              className="w-full px-3.5 py-3 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm text-charcoal placeholder:text-taupe transition-colors resize-y"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-ivory-deep border border-taupe/70 text-xs sm:text-sm text-charcoal"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-charcoal text-pure text-sm font-medium hover:bg-charcoal/90 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
            >
              <FileText className="w-4 h-4" />
              <span>{loading ? t.generating : t.generate}</span>
            </motion.button>

            {(topic || recipient || result) && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-beige text-xs font-medium text-charcoal/80 hover:text-charcoal hover:bg-ivory/70 transition-colors cursor-pointer min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.clear}</span>
              </button>
            )}
          </div>
        </form>

        {/* Output Surface */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-ivory/65 border border-beige/80 p-5 sm:p-6 min-h-[340px]">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-beige/60">
            <span className="text-xs font-semibold tracking-wide text-olive">
              {t.resultTitle}
            </span>

            {result?.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/80 hover:text-charcoal cursor-pointer"
              >
                {copied ? (
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

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="writer-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 py-8 space-y-3"
              >
                <div className="h-4 w-1/2 rounded bg-beige/50 animate-pulse" />
                <div className="h-3.5 w-full rounded bg-beige/40 animate-pulse" />
                <div className="h-3.5 w-11/12 rounded bg-beige/40 animate-pulse" />
                <div className="h-3.5 w-4/5 rounded bg-beige/40 animate-pulse" />
                <div className="h-3.5 w-5/6 rounded bg-beige/40 animate-pulse" />
              </motion.div>
            ) : result ? (
              <motion.div
                key="writer-result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
                className="flex-1 pt-4 space-y-4"
              >
                {result.title && (
                  <h4 className="font-serif text-xl font-semibold text-charcoal">
                    {result.title}
                  </h4>
                )}
                <div className="text-sm leading-relaxed text-charcoal whitespace-pre-wrap">
                  {result.content}
                </div>
                {result.notes && (
                  <div className="pt-3 border-t border-beige/60 text-xs text-charcoal/70">
                    <span className="font-semibold text-olive">{t.notesLabel}: </span>
                    {result.notes}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="writer-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center text-center px-4 py-12"
              >
                <p className="text-sm text-taupe max-w-xs">{t.emptyResult}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
