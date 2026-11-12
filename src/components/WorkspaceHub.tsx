import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquareText,
  PenLine,
  Languages,
  Calculator,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import type { Language, TranslationSchema } from '../i18n/translations';
import type { ToolId } from '../utils/api';
import { AssistantTool } from './tools/AssistantTool';
import { WriterTool } from './tools/WriterTool';
import { TranslatorTool } from './tools/TranslatorTool';
import { CalculatorTool } from './tools/CalculatorTool';
import { PlannerTool } from './tools/PlannerTool';

interface WorkspaceHubProps {
  language: Language;
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  t: TranslationSchema;
}

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function WorkspaceHub({
  language,
  activeTool,
  onSelectTool,
  t,
}: WorkspaceHubProps) {
  const tabs: Array<{ id: ToolId; label: string; icon: LucideIcon }> = [
    { id: 'assistant', label: t.workspace.tabs.assistant, icon: MessageSquareText },
    { id: 'writer', label: t.workspace.tabs.writer, icon: PenLine },
    { id: 'translator', label: t.workspace.tabs.translator, icon: Languages },
    { id: 'calculator', label: t.workspace.tabs.calculator, icon: Calculator },
    { id: 'planner', label: t.workspace.tabs.planner, icon: CalendarDays },
  ];

  return (
    <section
      id="workspace"
      className="py-12 sm:py-16 lg:py-20"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal tracking-[-0.01em]">
              {t.workspace.sectionTitle}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-charcoal/75">
              {t.workspace.sectionSubtitle}
            </p>
          </div>
        </motion.div>

        {/* Full-width 5-Tool Switcher Rail */}
        <div
          role="tablist"
          aria-label={t.workspace.sectionTitle}
          className="flex md:grid md:grid-cols-5 items-center gap-1.5 p-1.5 rounded-2xl bg-ivory-deep/85 border border-beige/80 overflow-x-auto"
        >
          {tabs.map((tab) => {
            const active = activeTool === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectTool(tab.id)}
                className={`relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-olive ${
                  active ? 'text-pure' : 'text-charcoal/80 hover:text-charcoal'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="workspace-tab-indicator"
                    className="absolute inset-0 rounded-xl bg-charcoal shadow-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <Icon className="relative z-10 w-4 h-4 shrink-0" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tool Surface */}
        <div className="bg-pure border border-beige/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_14px_40px_rgba(41,41,35,0.045)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
            >
              {activeTool === 'assistant' && (
                <AssistantTool language={language} t={t.assistant} errT={t.errors} />
              )}
              {activeTool === 'writer' && (
                <WriterTool language={language} t={t.writer} errT={t.errors} />
              )}
              {activeTool === 'translator' && (
                <TranslatorTool language={language} t={t.translator} errT={t.errors} />
              )}
              {activeTool === 'calculator' && (
                <CalculatorTool language={language} t={t.calculator} />
              )}
              {activeTool === 'planner' && (
                <PlannerTool language={language} t={t.planner} errT={t.errors} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
