import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { TranslationSchema } from '../i18n/translations';

interface EditorialGuideProps {
  t: TranslationSchema['guide'];
}

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function EditorialGuide({ t }: EditorialGuideProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="guide"
      className="py-14 sm:py-20 border-t border-beige/60"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Three-step editorial workflow */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
            className="max-w-2xl mb-10"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal tracking-[-0.01em]">
              {t.sectionTitle}
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-charcoal/75 leading-relaxed">
              {t.sectionSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{
                  opacity: 0,
                  y: 20,
                  x: index === 0 ? -12 : index === 2 ? 12 : 0,
                }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                  ease: EASE_EDITORIAL,
                }}
                whileHover={{ y: -3 }}
                className="bg-pure border border-beige/80 rounded-2xl p-6 sm:p-7 shadow-[0_8px_28px_rgba(41,41,35,0.035)] transition-colors duration-200 hover:border-taupe"
              >
                <span className="font-serif text-2xl font-semibold text-olive tabular-nums">
                  {step.number}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Animated FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
              {t.faqTitle}
            </h2>
          </div>

          <div className="lg:col-span-8 bg-pure border border-beige/80 rounded-2xl divide-y divide-beige/60 overflow-hidden shadow-[0_8px_28px_rgba(41,41,35,0.03)]">
            {t.faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-ivory/45 transition-colors cursor-pointer min-h-[56px]"
                  >
                    <span className="text-sm sm:text-base font-medium text-charcoal">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
                      className="shrink-0 text-olive"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: EASE_EDITORIAL }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-charcoal/75">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
