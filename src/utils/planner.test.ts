import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPlannerItem,
  togglePlannerItem,
  removePlannerItem,
  filterPlannerItems,
  computePlannerStats,
  mergeGeneratedPlan,
  parseStoredPlannerItems,
} from './planner';

test('planner item creation, toggling, filtering, and stats', () => {
  assert.equal(createPlannerItem('   ', '09:00', 'daily_plan'), null);

  const item1 = createPlannerItem('Morning review', '08:30', 'daily_plan', 't1')!;
  const item2 = createPlannerItem('Olive oil', '1 bottle', 'shopping_list', 't2')!;
  let list = [item1, item2];

  list = togglePlannerItem(list, item1.id);
  assert.equal(list[0].completed, true);
  assert.equal(list[1].completed, false);

  const stats = computePlannerStats(list);
  assert.equal(stats.total, 2);
  assert.equal(stats.completed, 1);
  assert.equal(stats.remaining, 1);
  assert.equal(stats.percent, 50);

  assert.equal(filterPlannerItems(list, 'shopping_list', 'active').length, 1);
  assert.equal(filterPlannerItems(list, 'all', 'completed').length, 1);

  list = removePlannerItem(list, item2.id);
  assert.equal(list.length, 1);
});

test('mergeGeneratedPlan prepends valid items and parseStoredPlannerItems safely recovers', () => {
  const merged = mergeGeneratedPlan(
    [],
    [
      { title: 'Deep work', timeOrQuantity: '09:00 - 11:00' },
      { title: '   ', timeOrQuantity: 'skip' },
    ],
    'schedule'
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].category, 'schedule');

  assert.deepEqual(parseStoredPlannerItems('invalid-json'), []);
  const restored = parseStoredPlannerItems(JSON.stringify(merged));
  assert.equal(restored.length, 1);
  assert.equal(restored[0].title, 'Deep work');
});
