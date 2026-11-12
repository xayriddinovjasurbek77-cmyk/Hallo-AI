import { useState, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import {
  LANGUAGE_META,
  TRANSLATIONS,
  type Language,
} from './i18n/translations';
import type { ToolId } from './utils/api';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WorkspaceHub } from './components/WorkspaceHub';
import { EditorialGuide } from './components/EditorialGuide';
import { Footer } from './components/Footer';

const LANGUAGE_STORAGE_KEY = 'hallo_language_v1';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'uz';
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'uz' || saved === 'en' || saved === 'ru') {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'uz';
}

export default function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [activeTool, setActiveTool] = useState<ToolId>('assistant');

  const t = TRANSLATIONS[language];

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = LANGUAGE_META[language].htmlLang;
    document.title = t.meta.title;
  }, [language, t.meta.title]);

  const handleStartWorking = () => {
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col text-charcoal selection:bg-olive/20">
        <AmbientBackdrop />

        <Header
          language={language}
          onLanguageChange={setLanguage}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          t={t.nav}
        />

        <main className="flex-1">
          <HeroSection t={t.hero} onStartWorking={handleStartWorking} />

          <WorkspaceHub
            language={language}
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            t={t}
          />

          <EditorialGuide t={t.guide} />
        </main>

        <Footer
          language={language}
          onLanguageChange={setLanguage}
          onSelectTool={setActiveTool}
          navT={t.nav}
          footerT={t.footer}
        />
      </div>
    </MotionConfig>
  );
}
