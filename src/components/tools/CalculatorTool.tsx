import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Equal, RotateCcw, AlertCircle } from 'lucide-react';
import type { Language, TranslationSchema } from '../../i18n/translations';
import {
  calculateDiscount,
  calculateExpenses,
  calculatePercentage,
  evaluateMathExpression,
  formatNumber,
  type ExpenseItem,
  type PercentageMode,
} from '../../utils/calculator';

interface CalculatorToolProps {
  language: Language;
  t: TranslationSchema['calculator'];
}

type CalcMode = 'percentage' | 'discount' | 'expenses' | 'math';

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export function CalculatorTool({ language, t }: CalculatorToolProps) {
  const locale = language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US';
  const [mode, setMode] = useState<CalcMode>('percentage');

  // 1. Percentage state
  const [pctType, setPctType] = useState<PercentageMode>('percent_of');
  const [pctA, setPctA] = useState('20');
  const [pctB, setPctB] = useState('450000');

  // 2. Discount state
  const [origPrice, setOrigPrice] = useState('250000');
  const [discountPct, setDiscountPct] = useState('15');
  const [taxPct, setTaxPct] = useState('0');

  // 3. Expenses state
  const [expenses, setExpenses] = useState<Array<ExpenseItem & { seedKey?: 'groceries' | 'transport' }>>([
    { id: 'seed-1', seedKey: 'groceries', title: 'Groceries', amount: 145000 },
    { id: 'seed-2', seedKey: 'transport', title: 'Transport', amount: 35000 },
  ]);

  const getExpenseDisplayTitle = (item: ExpenseItem & { seedKey?: 'groceries' | 'transport' }) => {
    if (item.seedKey === 'groceries') {
      return language === 'uz' ? 'Oziq-ovqat' : language === 'ru' ? 'Продукты' : 'Groceries';
    }
    if (item.seedKey === 'transport') {
      return language === 'uz' ? 'Transport' : language === 'ru' ? 'Транспорт' : 'Transport';
    }
    return item.title;
  };
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [splitCount, setSplitCount] = useState('2');
  const [expError, setExpError] = useState<string | null>(null);

  // 4. Math expression state
  const [expression, setExpression] = useState('(125 + 75) * 3');
  const [mathHistory, setMathHistory] = useState<Array<{ expr: string; result: string }>>([]);

  // Computations
  const parsedPctA = pctA.trim() === '' ? NaN : Number(pctA);
  const parsedPctB = pctB.trim() === '' ? NaN : Number(pctB);
  const pctResult = calculatePercentage(pctType, parsedPctA, parsedPctB);

  const parsedPrice = origPrice.trim() === '' ? NaN : Number(origPrice);
  const parsedDisc = discountPct.trim() === '' ? NaN : Number(discountPct);
  const parsedTax = taxPct.trim() === '' ? 0 : Number(taxPct);
  const discResult = calculateDiscount(parsedPrice, parsedDisc, parsedTax);

  const parsedSplit = splitCount.trim() === '' ? 0 : Number(splitCount);
  const expenseSummary = calculateExpenses(expenses, parsedSplit);

  const mathResult = evaluateMathExpression(expression);

  const handleAddExpense = () => {
    const cleanTitle = expTitle.trim();
    const numAmount = Number(expAmount);
    if (!cleanTitle || !Number.isFinite(numAmount) || numAmount <= 0) {
      setExpError(t.expenses.validationItem);
      return;
    }
    setExpError(null);
    setExpenses((prev) => [
      { id: `exp-${Date.now()}`, title: cleanTitle, amount: numAmount },
      ...prev,
    ]);
    setExpTitle('');
    setExpAmount('');
  };

  const handleCommitMath = () => {
    if (!mathResult.ok || mathResult.formatted === undefined) return;
    setMathHistory((prev) => [
      { expr: expression.trim(), result: mathResult.formatted! },
      ...prev.slice(0, 5),
    ]);
  };

  const appendKey = (val: string) => {
    setExpression((prev) => prev + val);
  };

  const modes: CalcMode[] = ['percentage', 'discount', 'expenses', 'math'];

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-beige/60">
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
          {t.title}
        </h3>
        <p className="mt-1 text-sm text-charcoal/75">{t.subtitle}</p>
      </div>

      {/* Mode Switcher */}
      <div
        role="tablist"
        aria-label={t.title}
        className="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-ivory-deep/75 border border-beige/70"
      >
        {modes.map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m)}
              className={`relative px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap min-h-[38px] ${
                active ? 'text-pure' : 'text-charcoal/80 hover:text-charcoal'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="calc-mode-bg"
                  className="absolute inset-0 rounded-lg bg-charcoal"
                  transition={{ type: 'spring', stiffness: 420, damping: 35 }}
                />
              )}
              <span className="relative z-10">{t.modes[m]}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'percentage' && (
          <motion.div
            key="calc-percentage"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="pct-mode" className="block text-xs font-medium text-charcoal/75">
                  {t.percentage.typeLabel}
                </label>
                <select
                  id="pct-mode"
                  value={pctType}
                  onChange={(e) => setPctType(e.target.value as PercentageMode)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/70 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-medium text-charcoal min-h-[44px] cursor-pointer"
                >
                  <option value="percent_of">{t.percentage.types.percent_of}</option>
                  <option value="what_percent">{t.percentage.types.what_percent}</option>
                  <option value="percent_change">{t.percentage.types.percent_change}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="pct-a" className="block text-xs font-medium text-charcoal/75">
                    {pctType === 'percent_of'
                      ? t.percentage.labelA
                      : pctType === 'what_percent'
                        ? t.percentage.labelA_what
                        : t.percentage.labelA_change}
                  </label>
                  <input
                    id="pct-a"
                    type="number"
                    step="any"
                    value={pctA}
                    onChange={(e) => setPctA(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-mono tabular-nums text-charcoal min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pct-b" className="block text-xs font-medium text-charcoal/75">
                    {pctType === 'percent_of'
                      ? t.percentage.labelB
                      : pctType === 'what_percent'
                        ? t.percentage.labelB_what
                        : t.percentage.labelB_change}
                  </label>
                  <input
                    id="pct-b"
                    type="number"
                    step="any"
                    value={pctB}
                    onChange={(e) => setPctB(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-mono tabular-nums text-charcoal min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-ivory/75 border border-beige/80 p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold tracking-wide text-olive">
                {t.percentage.resultLabel}
              </span>
              {pctResult.ok && pctResult.value !== undefined ? (
                <div className="my-4 space-y-2">
                  <p className="font-mono text-3xl sm:text-4xl font-medium text-charcoal tabular-nums">
                    {formatNumber(pctResult.value, locale)}
                    {pctType !== 'percent_of' ? '%' : ''}
                  </p>
                  <p className="text-xs font-mono text-charcoal/70 pt-2 border-t border-beige/60">
                    {t.percentage.formulaLabel}: {pctResult.formula}
                  </p>
                </div>
              ) : (
                <p className="my-4 text-sm text-charcoal/80">
                  {pctResult.errorCode ? t.errors[pctResult.errorCode] : t.errors.INVALID_NUMBER}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {mode === 'discount' && (
          <motion.div
            key="calc-discount"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="space-y-1.5 sm:col-span-3">
                <label htmlFor="disc-price" className="block text-xs font-medium text-charcoal/75">
                  {t.discount.priceLabel}
                </label>
                <input
                  id="disc-price"
                  type="number"
                  min="0"
                  step="any"
                  value={origPrice}
                  onChange={(e) => setOrigPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-mono tabular-nums text-charcoal min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="disc-pct" className="block text-xs font-medium text-charcoal/75">
                  {t.discount.discountLabel}
                </label>
                <input
                  id="disc-pct"
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-mono tabular-nums text-charcoal min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="disc-tax" className="block text-xs font-medium text-charcoal/75">
                  {t.discount.taxLabel}
                </label>
                <input
                  id="disc-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={taxPct}
                  onChange={(e) => setTaxPct(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-mono tabular-nums text-charcoal min-h-[44px]"
                />
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-ivory/75 border border-beige/80 p-6 space-y-4">
              {discResult.ok ? (
                <>
                  <div>
                    <span className="text-xs font-semibold tracking-wide text-olive">
                      {t.discount.finalPriceLabel}
                    </span>
                    <p className="mt-1 font-mono text-3xl sm:text-4xl font-medium text-charcoal tabular-nums">
                      {formatNumber(discResult.finalPrice ?? 0, locale)}
                    </p>
                  </div>

                  <dl className="pt-3 border-t border-beige/60 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-charcoal/70">{t.discount.savedLabel}</dt>
                      <dd className="font-mono tabular-nums font-medium text-olive">
                        −{formatNumber(discResult.discountAmount ?? 0, locale)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-charcoal/70">{t.discount.afterDiscountLabel}</dt>
                      <dd className="font-mono tabular-nums text-charcoal">
                        {formatNumber(discResult.priceAfterDiscount ?? 0, locale)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-charcoal/70">{t.discount.taxAmountLabel}</dt>
                      <dd className="font-mono tabular-nums text-charcoal">
                        +{formatNumber(discResult.taxAmount ?? 0, locale)}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="text-sm text-charcoal/80">
                  {discResult.errorCode ? t.errors[discResult.errorCode] : t.errors.INVALID_NUMBER}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {mode === 'expenses' && (
          <motion.div
            key="calc-expenses"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddExpense();
                }}
                className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 items-end"
              >
                <div className="space-y-1.5">
                  <label htmlFor="exp-name" className="block text-xs font-medium text-charcoal/75">
                    {t.expenses.itemNameLabel}
                  </label>
                  <input
                    id="exp-name"
                    type="text"
                    value={expTitle}
                    onChange={(e) => {
                      setExpTitle(e.target.value);
                      if (expError) setExpError(null);
                    }}
                    placeholder={t.expenses.itemNamePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm text-charcoal placeholder:text-taupe min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="exp-amount" className="block text-xs font-medium text-charcoal/75">
                    {t.expenses.amountLabel}
                  </label>
                  <input
                    id="exp-amount"
                    type="number"
                    min="0"
                    step="any"
                    value={expAmount}
                    onChange={(e) => {
                      setExpAmount(e.target.value);
                      if (expError) setExpError(null);
                    }}
                    placeholder={t.expenses.amountPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-sm font-mono tabular-nums text-charcoal min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-charcoal text-pure text-sm font-medium hover:bg-charcoal/90 transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.expenses.addItem}</span>
                </button>
              </form>

              {expError && (
                <div role="alert" className="flex items-center gap-2 text-xs text-charcoal bg-ivory-deep px-3 py-2 rounded-lg border border-taupe/60">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{expError}</span>
                </div>
              )}

              {/* Expense Rows */}
              <div className="rounded-2xl border border-beige/80 divide-y divide-beige/60 overflow-hidden bg-pure">
                {expenses.length === 0 ? (
                  <p className="p-6 text-sm text-taupe text-center">{t.expenses.emptyList}</p>
                ) : (
                  expenses.map((item) => {
                    const displayTitle = getExpenseDisplayTitle(item);
                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-ivory/40 transition-colors"
                      >
                        <span className="text-sm text-charcoal truncate">{displayTitle}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-mono tabular-nums text-charcoal">
                            {formatNumber(item.amount, locale)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpenses((prev) => prev.filter((x) => x.id !== item.id))}
                            aria-label={`${t.expenses.removeItem} ${displayTitle}`}
                            className="p-1.5 rounded-lg text-taupe hover:text-charcoal hover:bg-ivory-deep transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {expenses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpenses([])}
                  className="text-xs font-medium text-taupe hover:text-charcoal underline underline-offset-4 cursor-pointer"
                >
                  {t.expenses.clearAll}
                </button>
              )}
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-ivory/75 border border-beige/80 p-6 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="exp-split" className="block text-xs font-medium text-charcoal/75">
                  {t.expenses.splitLabel}
                </label>
                <input
                  id="exp-split"
                  type="number"
                  min="1"
                  step="1"
                  value={splitCount}
                  onChange={(e) => setSplitCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pure border border-beige focus:border-olive focus:outline-none text-sm font-mono tabular-nums text-charcoal min-h-[44px]"
                />
              </div>

              {expenseSummary.ok ? (
                <div className="space-y-4 pt-2 border-t border-beige/60">
                  <div>
                    <span className="text-xs font-semibold tracking-wide text-olive">
                      {t.expenses.totalLabel}
                    </span>
                    <p className="mt-1 font-mono text-3xl font-medium text-charcoal tabular-nums">
                      {formatNumber(expenseSummary.total, locale)}
                    </p>
                  </div>

                  <dl className="space-y-2 text-xs sm:text-sm pt-2 border-t border-beige/60">
                    <div className="flex items-center justify-between">
                      <dt className="text-charcoal/70">{t.expenses.perPersonLabel}</dt>
                      <dd className="font-mono tabular-nums font-semibold text-charcoal">
                        {formatNumber(expenseSummary.perPerson, locale)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-charcoal/70">{t.expenses.averageLabel}</dt>
                      <dd className="font-mono tabular-nums text-charcoal">
                        {formatNumber(expenseSummary.average, locale)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-charcoal/70">{t.expenses.countLabel}</dt>
                      <dd className="font-mono tabular-nums text-charcoal">
                        {expenseSummary.count}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="text-sm text-charcoal/80">
                  {expenseSummary.errorCode ? t.errors[expenseSummary.errorCode] : ''}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {mode === 'math' && (
          <motion.div
            key="calc-math"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCommitMath();
                }}
                className="space-y-2"
              >
                <label htmlFor="math-expr" className="block text-xs font-medium text-charcoal/75">
                  {t.math.expressionLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    id="math-expr"
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder={t.math.expressionPlaceholder}
                    className="flex-1 px-4 py-3 rounded-xl bg-ivory/60 border border-beige focus:border-olive focus:bg-pure focus:outline-none text-base font-mono tabular-nums text-charcoal min-h-[46px]"
                  />
                  <button
                    type="submit"
                    aria-label={t.math.evaluate}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-charcoal text-pure text-sm font-medium hover:bg-charcoal/90 transition-colors cursor-pointer min-h-[46px]"
                  >
                    <Equal className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.math.evaluate}</span>
                  </button>
                </div>
              </form>

              {/* Compact Tactical Keypad */}
              <div className="grid grid-cols-4 gap-2">
                {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '(', ')'].map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => appendKey(key === '÷' ? ' / ' : key === '×' ? ' * ' : key === '−' ? ' - ' : key)}
                      className="py-2.5 rounded-xl bg-ivory/75 border border-beige/80 hover:border-taupe hover:bg-ivory text-sm font-mono font-medium text-charcoal transition-colors cursor-pointer min-h-[42px]"
                    >
                      {key}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => appendKey(' + ')}
                  className="py-2.5 rounded-xl bg-ivory/75 border border-beige/80 hover:border-taupe text-sm font-mono font-medium text-charcoal cursor-pointer min-h-[42px]"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => appendKey(' % ')}
                  className="py-2.5 rounded-xl bg-ivory/75 border border-beige/80 hover:border-taupe text-sm font-mono font-medium text-charcoal cursor-pointer min-h-[42px]"
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setExpression((prev) => prev.slice(0, -1))}
                  className="py-2.5 rounded-xl bg-ivory/75 border border-beige/80 hover:border-taupe text-xs font-medium text-charcoal cursor-pointer min-h-[42px]"
                >
                  ⌫
                </button>
                <button
                  type="button"
                  onClick={() => setExpression('')}
                  className="inline-flex items-center justify-center py-2.5 rounded-xl bg-ivory-deep border border-beige hover:border-taupe text-xs font-medium text-charcoal cursor-pointer min-h-[42px]"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>{t.math.clear}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-ivory/75 border border-beige/80 p-6 flex flex-col justify-between space-y-5">
              <div>
                <span className="text-xs font-semibold tracking-wide text-olive">
                  {t.math.resultLabel}
                </span>
                {mathResult.ok && mathResult.value !== undefined ? (
                  <p className="mt-2 font-mono text-3xl sm:text-4xl font-medium text-charcoal tabular-nums break-all">
                    {formatNumber(mathResult.value, locale)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-charcoal/80">
                    {mathResult.errorCode ? t.errors[mathResult.errorCode] : ''}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-beige/60 space-y-2">
                <span className="block text-xs font-medium text-charcoal/70">
                  {t.math.historyLabel}
                </span>
                {mathHistory.length === 0 ? (
                  <p className="text-xs text-taupe">{t.math.emptyHistory}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {mathHistory.map((h, i) => (
                      <li
                        key={`${h.expr}-${i}`}
                        className="flex items-center justify-between gap-3 text-xs font-mono"
                      >
                        <button
                          type="button"
                          onClick={() => setExpression(h.expr)}
                          className="text-charcoal/75 hover:text-charcoal truncate cursor-pointer"
                        >
                          {h.expr}
                        </button>
                        <span className="font-semibold text-charcoal tabular-nums shrink-0">
                          = {h.result}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
