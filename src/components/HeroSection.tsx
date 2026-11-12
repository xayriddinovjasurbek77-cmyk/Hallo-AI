import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { TranslationSchema } from '../i18n/translations';
import heroArtwork from '../assets/images/hero_editorial_atelier_1794512907297.jpg';

interface HeroSectionProps {
  t: TranslationSchema['hero'];
  onStartWorking: () => void;
}

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ t, onStartWorking }: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="top"
      className="pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 border-b border-beige/60"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Editorial Copy Column */}
          <motion.div
            className="lg:col-span-7 flex flex-col justify-between gap-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
          >
            <div className="space-y-5">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: EASE_EDITORIAL }}
                className="text-xs sm:text-[13px] font-medium tracking-[0.06em] text-olive"
              >
                {t.kicker}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12, ease: EASE_EDITORIAL }}
                className="font-serif font-semibold text-charcoal leading-[1.08] tracking-[-0.015em] max-w-2xl"
                style={{
                  fontSize: 'clamp(2.25rem, 4.1vw, 3.75rem)',
                  textWrap: 'balance',
                }}
              >
                {t.headline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE_EDITORIAL }}
                className="text-base sm:text-[17px] leading-[1.65] text-charcoal/80 max-w-xl"
              >
                {t.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28, ease: EASE_EDITORIAL }}
                className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6"
              >
                <motion.button
                  type="button"
                  onClick={onStartWorking}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-charcoal text-pure text-sm font-medium hover:bg-charcoal/90 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive"
                >
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <a
                  href="#guide"
                  className="inline-flex items-center gap-2 py-2 text-sm font-medium text-charcoal/80 hover:text-charcoal border-b border-transparent hover:border-olive transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <span>{t.secondaryCta}</span>
                </a>
              </motion.div>
            </div>

            {/* Clean unboxed 3-column editorial highlights */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36, ease: EASE_EDITORIAL }}
              className="pt-6 border-t border-beige/70 grid grid-cols-1 sm:grid-cols-3 gap-5"
            >
              <div>
                <h2 className="text-sm font-semibold text-charcoal">{t.highlights.instantTitle}</h2>
                <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-charcoal/70">
                  {t.highlights.instantDesc}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-charcoal">{t.highlights.multilingualTitle}</h2>
                <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-charcoal/70">
                  {t.highlights.multilingualDesc}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-charcoal">{t.highlights.practicalTitle}</h2>
                <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-charcoal/70">
                  {t.highlights.practicalDesc}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Editorial Frame Column */}
          <motion.div
            className="lg:col-span-5 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: EASE_EDITORIAL }}
          >
            <motion.figure
              whileHover={{ y: -3 }}
              transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
              className="flex-1 flex flex-col bg-pure border border-beige/80 rounded-2xl p-3 sm:p-4 shadow-[0_12px_36px_rgba(41,41,35,0.05)]"
            >
              <div className="relative flex-1 min-h-[240px] sm:min-h-[300px] overflow-hidden rounded-xl bg-ivory-deep">
                {!imageError ? (
                  <img
                    src={heroArtwork}
                    alt={t.imageAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-ivory to-ivory-deep text-taupe">
                    <BookOpen className="w-10 h-10 mb-3 text-olive" />
                    <span className="font-serif text-xl text-charcoal">HALLO</span>
                  </div>
                )}
              </div>
              <figcaption className="pt-3 px-1 text-xs font-serif italic text-charcoal/70">
                {t.imageCaption}
              </figcaption>
            </motion.figure>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
