import {
  LANGUAGE_META,
  SUPPORTED_LANGUAGES,
  type Language,
  type TranslationSchema,
} from '../i18n/translations';
import type { ToolId } from '../utils/api';

interface FooterProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectTool: (tool: ToolId) => void;
  navT: TranslationSchema['nav'];
  footerT: TranslationSchema['footer'];
}

export function Footer({
  language,
  onLanguageChange,
  onSelectTool,
  navT,
  footerT,
}: FooterProps) {
  const links: Array<{ id: ToolId; label: string }> = [
    { id: 'assistant', label: navT.assistant },
    { id: 'writer', label: navT.writer },
    { id: 'translator', label: navT.translator },
    { id: 'calculator', label: navT.calculator },
    { id: 'planner', label: navT.planner },
  ];

  const handleJump = (tool: ToolId) => {
    onSelectTool(tool);
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="border-t border-beige/70 bg-ivory-deep/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-beige/60">
          <div>
            <span className="font-serif text-2xl font-semibold tracking-[0.06em] text-charcoal">
              HALLO
            </span>
            <p className="mt-1.5 text-sm text-charcoal/70">{footerT.tagline}</p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleJump(item.id)}
                className="text-sm text-charcoal/75 hover:text-charcoal transition-colors cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-charcoal/65">
          <div className="flex flex-wrap items-center gap-3">
            <span>{footerT.copyright}</span>
            <span aria-hidden="true">·</span>
            <span>{footerT.noAccountNotice}</span>
          </div>

          <div className="flex items-center gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`cursor-pointer transition-colors ${
                  language === lang
                    ? 'font-semibold text-charcoal underline underline-offset-4 decoration-olive'
                    : 'text-charcoal/65 hover:text-charcoal'
                }`}
              >
                {LANGUAGE_META[lang].nativeName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
