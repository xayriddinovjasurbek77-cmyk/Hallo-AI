import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, Copy, Check, Languages, RotateCcw, AlertCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type Language, type TranslationSchema } from '../../i18n/translations';
import {
  postJson,
  resolveLocalizedError,
  type SourceLanguageOption,
  type TranslateResult,
} from '../../utils/api';

interface TranslatorToolProps {
  language: Language;
  t: TranslationSchema['translator'];
  errT: TranslationSchema['errors'];
}

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function TranslatorTool({ language, t, errT }: TranslatorToolProps) {
  const [sourceLang, setSourceLang] = useState<SourceLanguageOption>('auto');
  const [targetLang, setTargetLang] = useState<Language>(language === 'en' ? 'uz' : 'en');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [swapRotation, setSwapRotation] = useState(0);

  const handleSwap = () => {
    setSwapRotation((r) => r + 180);
    if (sourceLang === 'auto') {
      const detected = result?.detectedLanguage;
      if (detected === 'uz' || detected === 'en' || detected === 'ru') {
        setSourceLang(targetLang);
        setTargetLang(detected);
      } else {
        setSourceLang(targetLang);
        setTargetLang(targetLang === 'uz' ? 'en' : 'uz');
      }
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }

    if (result?.translation) {
      setInputText(result.translation);
      setResult(null);
    }
    setError(null);
  };

  const handleTranslate = async () => {
    const clean = inputText.trim();
    if (!clean) {
      setError(t.validationEmpty);
      return;
    }
    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      setError(t.validationSameLang);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await postJson<TranslateResult>('/api/ai/translate', {
        text: clean,
        sourceLang,
        targetLang,
        uiLanguage: language,
      });
      setResult(data);
    } catch (err) {
      setError(resolveLocalizedError(err, errT));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.translation) return;
    try {
      await navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const formatDetectedLabel = (code: string) => {
    if (code === 'uz' || code === 'en' || code === 'ru') {
      return t.languages[code];
    }
    return code;
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-beige/60">
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
          {t.title}
        </h3>
        <p className="mt-1 text-sm text-charcoal/75">{t.subtitle}</p>
      </div>

      {/* Language Selection Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="translator-source-lang" className="block text-xs font-medium text-charcoal/75">
            {t.sourceLabel}
          </label>
          <select
            id="translator-source-lang"
            value={sourceLang}
            onChange={(e) => {
              setSourceLang(e.target.value as SourceLanguageOption);
              setError(null);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/70 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-medium text-charcoal min-h-[44px] cursor-pointer"
          >
            <option value="auto">{t.autoDetect}</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {t.languages[lang]}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          type="button"
          onClick={handleSwap}
          aria-label={t.swapLanguages}
          animate={{ rotate: swapRotation }}
          transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-beige bg-ivory/70 hover:bg-ivory text-charcoal transition-colors cursor-pointer justify-self-center"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </motion.button>

        <div className="space-y-1.5">
          <label htmlFor="translator-target-lang" className="block text-xs font-medium text-charcoal/75">
            {t.targetLabel}
          </label>
          <select
            id="translator-target-lang"
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value as Language);
              setError(null);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/70 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-medium text-charcoal min-h-[44px] cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {t.languages[lang]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-Column Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="translator-input" className="text-xs font-medium text-charcoal/75">
              {t.inputLabel}
            </label>
            <span className="text-xs text-taupe tabular-nums">
              {inputText.length} {t.charCount}
            </span>
          </div>
          <textarea
            id="translator-input"
            rows={6}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t.inputPlaceholder}
            className="w-full flex-1 px-4 py-3.5 rounded-2xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm leading-relaxed text-charcoal placeholder:text-taupe transition-colors resize-y min-h-[190px]"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-charcoal/75">{t.resultLabel}</span>
            <div className="flex items-center gap-3">
              {result?.detectedLanguage && sourceLang === 'auto' && (
                <span className="text-xs text-olive">
                  {t.detectedPrefix} {formatDetectedLabel(result.detectedLanguage)}
                </span>
              )}
              {result?.translation && (
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
          </div>

          <div className="flex-1 rounded-2xl bg-ivory/65 border border-beige/80 p-4 min-h-[190px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="trans-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2.5 py-2"
                >
                  <div className="h-3.5 w-4/5 rounded bg-beige/50 animate-pulse" />
                  <div className="h-3.5 w-full rounded bg-beige/40 animate-pulse" />
                  <div className="h-3.5 w-2/3 rounded bg-beige/40 animate-pulse" />
                </motion.div>
              ) : result?.translation ? (
                <motion.div
                  key="trans-result"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                  className="space-y-4"
                >
                  <p className="text-sm leading-relaxed text-charcoal whitespace-pre-wrap">
                    {result.translation}
                  </p>
                  {result.nuance && (
                    <div className="pt-3 border-t border-beige/60 text-xs text-charcoal/70">
                      <span className="font-semibold text-olive">{t.nuanceLabel}: </span>
                      {result.nuance}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.p
                  key="trans-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-taupe m-auto text-center"
                >
                  {t.emptyResult}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-ivory-deep border border-taupe/70 text-sm text-charcoal"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          onClick={handleTranslate}
          disabled={loading}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-charcoal text-pure text-sm font-medium hover:bg-charcoal/90 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
        >
          <Languages className="w-4 h-4" />
          <span>{loading ? t.translating : t.translate}</span>
        </motion.button>

        {(inputText || result) && (
          <button
            type="button"
            onClick={() => {
              setInputText('');
              setResult(null);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-beige text-xs font-medium text-charcoal/80 hover:text-charcoal hover:bg-ivory/70 transition-colors cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clear}</span>
          </button>
        )}
      </div>
    </div>
  );
}
