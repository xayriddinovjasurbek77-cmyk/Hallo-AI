export type PlannerCategory = 'daily_plan' | 'tasks' | 'shopping_list' | 'schedule';
export type PlannerFilter = 'all' | 'active' | 'completed';

export interface PlannerItem {
  id: string;
  title: string;
  meta: string;
  category: PlannerCategory;
  completed: boolean;
  createdAt: number;
}

export function createPlannerItem(
  title: string,
  meta: string,
  category: PlannerCategory,
  idPrefix = 'item'
): PlannerItem | null {
  const cleanTitle = title.trim();
  if (!cleanTitle) return null;
  return {
    id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: cleanTitle,
    meta: meta.trim(),
    category,
    completed: false,
    createdAt: Date.now(),
  };
}

export function togglePlannerItem(items: PlannerItem[], id: string): PlannerItem[] {
  return items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
}

export function removePlannerItem(items: PlannerItem[], id: string): PlannerItem[] {
  return items.filter((item) => item.id !== id);
}

export function filterPlannerItems(
  items: PlannerItem[],
  category: PlannerCategory | 'all',
  statusFilter: PlannerFilter
): PlannerItem[] {
  return items.filter((item) => {
    const matchesCat = category === 'all' || item.category === category;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !item.completed) ||
      (statusFilter === 'completed' && item.completed);
    return matchesCat && matchesStatus;
  });
}

export function computePlannerStats(items: PlannerItem[]) {
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const remaining = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, remaining, percent };
}

export function mergeGeneratedPlan(
  existing: PlannerItem[],
  generated: Array<{ title: string; timeOrQuantity: string }>,
  category: PlannerCategory
): PlannerItem[] {
  const created = generated
    .map((entry, idx) => createPlannerItem(entry.title, entry.timeOrQuantity, category, `ai-${idx}`))
    .filter((item): item is PlannerItem => item !== null);
  return [...created, ...existing];
}

export function parseStoredPlannerItems(raw: string | null): PlannerItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PlannerItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.completed === 'boolean' &&
        (item.category === 'daily_plan' ||
          item.category === 'tasks' ||
          item.category === 'shopping_list' ||
          item.category === 'schedule')
    );
  } catch {
    return [];
  }
}
