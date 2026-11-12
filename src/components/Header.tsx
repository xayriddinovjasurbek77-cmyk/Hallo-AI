import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import {
  LANGUAGE_META,
  SUPPORTED_LANGUAGES,
  type Language,
  type TranslationSchema,
} from '../i18n/translations';
import type { ToolId } from '../utils/api';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  t: TranslationSchema['nav'];
}

export function Header({
  language,
  onLanguageChange,
  activeTool,
  onSelectTool,
  t,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ id: ToolId; label: string }> = [
    { id: 'assistant', label: t.assistant },
    { id: 'writer', label: t.writer },
    { id: 'translator', label: t.translator },
    { id: 'calculator', label: t.calculator },
    { id: 'planner', label: t.planner },
  ];

  const handleNavClick = (tool: ToolId) => {
    onSelectTool(tool);
    setMobileOpen(false);
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-beige/60 bg-ivory/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-serif text-2xl sm:text-[26px] font-semibold tracking-[0.06em] text-charcoal whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive"
        >
          HALLO
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-6"
        >
          {navItems.map((item) => {
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive ${
                  isActive ? 'text-charcoal' : 'text-taupe hover:text-charcoal'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="header-nav-underline"
                    className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-olive"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language selector + Mobile toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label={t.languageLabel}
            className="inline-flex items-center p-1 rounded-lg bg-ivory-deep/80 border border-beige/70"
          >
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  aria-pressed={active}
                  aria-label={`${t.languageLabel}: ${LANGUAGE_META[lang].nativeName}`}
                  className={`relative px-2.5 py-1 text-xs font-semibold tracking-wider rounded-md transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer min-h-[30px] focus-visible:outline-2 focus-visible:outline-olive ${
                    active ? 'text-pure' : 'text-charcoal/75 hover:text-charcoal'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="header-lang-bg"
                      className="absolute inset-0 rounded-md bg-charcoal"
                      transition={{ type: 'spring', stiffness: 420, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{LANGUAGE_META[lang].code}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-beige/80 bg-pure/80 text-charcoal hover:bg-pure transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Smooth Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-beige/60 bg-ivory"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeTool === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-[44px] flex items-center justify-between ${
                      isActive
                        ? 'bg-pure text-charcoal border border-beige/70'
                        : 'text-charcoal/75 hover:bg-ivory-deep/70 hover:text-charcoal'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-olive" />}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
