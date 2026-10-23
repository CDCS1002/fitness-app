import test from 'node:test';
import assert from 'node:assert/strict';
import { dayEnergy, balanceLabel, expectedKg } from '../src/lib/energy.js';
import { buildDays, weeklySummary } from '../src/lib/weekly.js';

test('fuera del entreno = total − kcal de actividades', () => {
  const e = dayEnergy({ total: 2650, workouts: 480, eaten: 2040 });
  assert.deepEqual(e, { total: 2650, workouts: 480, outside: 2170, balance: -610, inconsistent: false });
});

test('sin total no hay balance ni resta', () => {
  const e = dayEnergy({ total: null, workouts: 300, eaten: 2000 });
  assert.equal(e.outside, null);
  assert.equal(e.balance, null);
});

test('total menor que entrenamientos se marca como inconsistente', () => {
  const e = dayEnergy({ total: 400, workouts: 500 });
  assert.equal(e.inconsistent, true);
  assert.equal(e.outside, 0);
});

test('etiquetas de balance y peso esperado', () => {
  assert.equal(balanceLabel(-610), 'déficit');
  assert.equal(balanceLabel(80), 'equilibrio');
  assert.equal(balanceLabel(350), 'superávit');
  assert.equal(expectedKg(-3850), -0.5);
});

test('resumen semanal promedia gasto total y balance solo en días con ambos datos', () => {
  const plans = [{ name: 'P', start_date: '2026-01-01', targets: {} }];
  const days = buildDays({
    entries: [
      { eaten_on: '2026-10-12', kcal: 2000, portions: {} },
      { eaten_on: '2026-10-13', kcal: 2200, portions: {} },
      { eaten_on: '2026-10-14', kcal: 1900, portions: {} },
    ],
    logs: [
      { day: '2026-10-12', water_ml: 0, total_kcal: 2600 },
      { day: '2026-10-13', water_ml: 0, total_kcal: 2400 },
      { day: '2026-10-15', water_ml: 0, total_kcal: 2500 }, // sin comida: entra en gasto, no en balance
    ],
    activities: [{ day: '2026-10-12', active_kcal: 500 }],
  });
  assert.equal(days['2026-10-12'].totalKcal, 2600);
  const [w] = weeklySummary(days, plans, '2026-10-12', '2026-10-18');
  assert.equal(w.totalKcal, 2500); // (2600 + 2400 + 2500) / 3
  assert.equal(w.balance, -400); // (−600 − 200) / 2
  assert.equal(w.balanceDays, 2);
  assert.equal(w.expectedKg, expectedKg(-800));
});
