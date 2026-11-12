import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Check, CalendarCheck2, Sparkles, AlertCircle } from 'lucide-react';
import type { Language, TranslationSchema } from '../../i18n/translations';
import { postJson, resolveLocalizedError, type PlannerAiResponse } from '../../utils/api';
import {
  computePlannerStats,
  createPlannerItem,
  filterPlannerItems,
  mergeGeneratedPlan,
  parseStoredPlannerItems,
  removePlannerItem,
  togglePlannerItem,
  type PlannerCategory,
  type PlannerFilter,
  type PlannerItem,
} from '../../utils/planner';

interface PlannerToolProps {
  language: Language;
  t: TranslationSchema['planner'];
  errT: TranslationSchema['errors'];
}

const STORAGE_KEY = 'hallo_planner_items_v1';
const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function PlannerTool({ language, t, errT }: PlannerToolProps) {
  const [items, setItems] = useState<PlannerItem[]>(() => {
    if (typeof window === 'undefined') return [];
    return parseStoredPlannerItems(window.localStorage.getItem(STORAGE_KEY));
  });

  const [category, setCategory] = useState<PlannerCategory>('daily_plan');
  const [statusFilter, setStatusFilter] = useState<PlannerFilter>('all');
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [aiGoal, setAiGoal] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items]);

  const categories: PlannerCategory[] = ['daily_plan', 'tasks', 'shopping_list', 'schedule'];
  const filters: PlannerFilter[] = ['all', 'active', 'completed'];

  const categoryItems = filterPlannerItems(items, category, statusFilter);
  const categoryStats = computePlannerStats(items.filter((i) => i.category === category));

  const handleAddManual = () => {
    const created = createPlannerItem(title, meta, category);
    if (!created) {
      setError(t.validationEmpty);
      return;
    }
    setError(null);
    setItems((prev) => [created, ...prev]);
    setTitle('');
    setMeta('');
  };

  const handleGenerateAiPlan = async () => {
    const cleanGoal = aiGoal.trim();
    if (!cleanGoal) {
      setError(t.validationAiEmpty);
      return;
    }

    setError(null);
    setAiLoading(true);
    try {
      const data = await postJson<PlannerAiResponse>('/api/ai/planner', {
        category,
        goal: cleanGoal,
        language,
      });
      if (data.items.length > 0) {
        setItems((prev) => mergeGeneratedPlan(prev, data.items, category));
        setAiGoal('');
      }
    } catch (err) {
      setError(resolveLocalizedError(err, errT));
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearCompleted = () => {
    setItems((prev) => prev.filter((item) => !(item.category === category && item.completed)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-beige/60">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
            {t.title}
          </h3>
          <p className="mt-1 text-sm text-charcoal/75">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-4 text-xs text-charcoal/75 tabular-nums shrink-0">
          <span>
            {t.statsCompleted}: <strong className="text-charcoal">{categoryStats.completed}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {t.statsRemaining}: <strong className="text-charcoal">{categoryStats.remaining}</strong>
          </span>
        </div>
      </div>

      {/* Category Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={t.title}
          className="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-ivory-deep/75 border border-beige/70"
        >
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setCategory(cat);
                  setError(null);
                }}
                className={`relative px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap min-h-[38px] ${
                  active ? 'text-pure' : 'text-charcoal/80 hover:text-charcoal'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="planner-cat-bg"
                    className="absolute inset-0 rounded-lg bg-charcoal"
                    transition={{ type: 'spring', stiffness: 420, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{t.categories[cat]}</span>
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-ivory/70 border border-beige/70">
          {filters.map((f) => {
            const active = statusFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[34px] ${
                  active ? 'bg-pure text-charcoal shadow-xs' : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                {t.filters[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Creation Bar: AI Builder + Manual Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleGenerateAiPlan();
          }}
          className="lg:col-span-6 rounded-2xl bg-ivory/75 border border-beige/80 p-5 space-y-3"
        >
          <label htmlFor="planner-ai-goal" className="flex items-center gap-2 text-xs font-semibold text-olive">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.aiSectionTitle}</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="planner-ai-goal"
              type="text"
              value={aiGoal}
              onChange={(e) => {
                setAiGoal(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t.aiPromptPlaceholder}
              disabled={aiLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-pure border border-beige focus:border-olive focus:outline-none text-sm text-charcoal placeholder:text-taupe min-h-[44px]"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-olive text-pure text-sm font-medium hover:bg-olive/90 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
            >
              <span>{aiLoading ? t.aiGenerating : t.aiGenerate}</span>
            </button>
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddManual();
          }}
          className="lg:col-span-6 rounded-2xl bg-ivory/50 border border-beige/80 p-5 space-y-3"
        >
          <span className="block text-xs font-semibold text-charcoal/80">
            {t.manualSectionTitle}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2.5 items-end">
            <div>
              <label htmlFor="planner-item-title" className="sr-only">
                {t.itemTitleLabel}
              </label>
              <input
                id="planner-item-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t.itemTitlePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-pure border border-beige focus:border-olive focus:outline-none text-sm text-charcoal placeholder:text-taupe min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="planner-item-meta" className="sr-only">
                {t.itemMetaLabel}
              </label>
              <input
                id="planner-item-meta"
                type="text"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder={t.itemMetaPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-pure border border-beige focus:border-olive focus:outline-none text-sm text-charcoal placeholder:text-taupe min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-charcoal text-pure text-sm font-medium hover:bg-charcoal/90 transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addItem}</span>
            </button>
          </div>
        </form>
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

      {/* Items List */}
      <div className="rounded-2xl border border-beige/80 bg-pure overflow-hidden">
        {categoryItems.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-2">
            <CalendarCheck2 className="w-7 h-7 text-olive mx-auto" />
            <p className="text-sm font-medium text-charcoal">{t.emptyTitle}</p>
            <p className="text-xs text-taupe max-w-md mx-auto">{t.emptySubtitle}</p>
          </div>
        ) : (
          <ul className="divide-y divide-beige/60">
            <AnimatePresence initial={false}>
              {categoryItems.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
                  className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-ivory/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setItems((prev) => togglePlannerItem(prev, item.id))}
                      aria-label={`${t.toggleDone}: ${item.title}`}
                      aria-pressed={item.completed}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        item.completed
                          ? 'bg-olive border-olive text-pure'
                          : 'border-taupe hover:border-charcoal bg-pure'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium transition-colors truncate ${
                          item.completed ? 'line-through text-taupe' : 'text-charcoal'
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.meta && (
                        <p className="text-xs text-charcoal/65 tabular-nums truncate">
                          {item.meta}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItems((prev) => removePlannerItem(prev, item.id))}
                    aria-label={`${t.deleteItem} ${item.title}`}
                    className="p-2 rounded-lg text-taupe hover:text-charcoal hover:bg-ivory-deep transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {categoryStats.completed > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClearCompleted}
            className="text-xs font-medium text-taupe hover:text-charcoal underline underline-offset-4 cursor-pointer"
          >
            {t.clearCompleted}
          </button>
        </div>
      )}
    </div>
  );
}
