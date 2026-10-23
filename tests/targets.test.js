import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateFromPortions, dayTargets, kcalStatus } from '../src/lib/targets.js';

const PLAN = { targets: { proteina: 15, carbohidrato: 9, grasa: 3, lacteo: 2, vegetal: 3, fruta: 2 } };

test('Estimación de kcal y macros desde las porciones del plan', () => {
  const e = estimateFromPortions(PLAN.targets);
  assert.equal(e.kcal, 15 * 45 + 9 * 80 + 3 * 45 + 2 * 100 + 3 * 25 + 2 * 60); // 1925
  assert.equal(e.protein, 105 + 27 + 16 + 6);
  assert.equal(e.carbs, 135 + 24 + 15 + 30);
  assert.equal(e.fat, 30 + 9 + 15 + 3);
});

test('Meta explícita y tolerancia ±10 %', () => {
  const t = dayTargets({ ...PLAN, kcal_target: 2250 });
  assert.deepEqual([t.kcal, t.low, t.high, t.estimated], [2250, 2025, 2475, false]);
  assert.equal(dayTargets(PLAN).estimated, true);
});

test('Estados del medidor', () => {
  const t = { low: 2025, high: 2475 };
  assert.equal(kcalStatus(1800, t).state, 'under');
  assert.equal(kcalStatus(2300, t).state, 'in');
  assert.equal(kcalStatus(2500, t).state, 'over');
  assert.match(kcalStatus(1800, t).text, /Faltan 225/);
});
