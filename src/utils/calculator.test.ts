import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePercentage,
  calculateDiscount,
  calculateExpenses,
  evaluateMathExpression,
} from './calculator';

test('calculatePercentage handles all three modes accurately', () => {
  const r1 = calculatePercentage('percent_of', 25, 400);
  assert.equal(r1.ok, true);
  assert.equal(r1.value, 100);

  const r2 = calculatePercentage('what_percent', 45, 180);
  assert.equal(r2.ok, true);
  assert.equal(r2.value, 25);

  const r3 = calculatePercentage('percent_change', 200, 250);
  assert.equal(r3.ok, true);
  assert.equal(r3.value, 25);

  const rZero = calculatePercentage('what_percent', 10, 0);
  assert.equal(rZero.ok, false);
  assert.equal(rZero.errorCode, 'DIVISION_BY_ZERO');
});

test('calculateDiscount computes discount, tax, and validates bounds', () => {
  const res = calculateDiscount(120000, 15, 0);
  assert.equal(res.ok, true);
  assert.equal(res.discountAmount, 18000);
  assert.equal(res.finalPrice, 102000);

  const withTax = calculateDiscount(100, 20, 10);
  assert.equal(withTax.ok, true);
  assert.equal(withTax.priceAfterDiscount, 80);
  assert.equal(withTax.taxAmount, 8);
  assert.equal(withTax.finalPrice, 88);

  const invalid = calculateDiscount(-50, 10, 0);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.errorCode, 'NEGATIVE_VALUE');

  const invalidPct = calculateDiscount(100, 150, 0);
  assert.equal(invalidPct.ok, false);
  assert.equal(invalidPct.errorCode, 'INVALID_PERCENT');
});

test('calculateExpenses aggregates total, average, and split correctly', () => {
  const items = [
    { id: '1', title: 'Groceries', amount: 150000 },
    { id: '2', title: 'Transport', amount: 30000 },
  ];
  const summary = calculateExpenses(items, 3);
  assert.equal(summary.ok, true);
  assert.equal(summary.total, 180000);
  assert.equal(summary.average, 90000);
  assert.equal(summary.perPerson, 60000);

  const badSplit = calculateExpenses(items, 0);
  assert.equal(badSplit.ok, false);
  assert.equal(badSplit.errorCode, 'INVALID_SPLIT_COUNT');
});

test('evaluateMathExpression parses arithmetic with precedence and rejects unsafe/invalid expressions', () => {
  assert.equal(evaluateMathExpression('(125 + 75) * 3').value, 600);
  assert.equal(evaluateMathExpression('100 - 15 / 3').value, 95);
  assert.equal(evaluateMathExpression('-5 + 12.5 * 2').value, 20);
  assert.equal(evaluateMathExpression('10 ÷ 4').value, 2.5);

  const divZero = evaluateMathExpression('10 / 0');
  assert.equal(divZero.ok, false);
  assert.equal(divZero.errorCode, 'DIVISION_BY_ZERO');

  const invalidChar = evaluateMathExpression('alert(1)');
  assert.equal(invalidChar.ok, false);
  assert.equal(invalidChar.errorCode, 'INVALID_CHARACTER');

  const empty = evaluateMathExpression('   ');
  assert.equal(empty.ok, false);
  assert.equal(empty.errorCode, 'EMPTY_EXPRESSION');
});
