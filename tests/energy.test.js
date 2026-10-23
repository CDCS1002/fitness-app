import test from 'node:test';
import assert from 'node:assert/strict';
import { dayEnergy, balanceLabel, expectedKg, bmrFor } from '../src/lib/energy.js';
import { buildDays, weeklySummary } from '../src/lib/weekly.js';

test('día del Sheet (15/10): activas del día 1491, entrenamientos 1186, basal 1653', () => {
  const e = dayEnergy({ dayActive: 1491, workouts: 1186, bmr: 1653, eaten: 2311 });
  assert.deepEqual(e, { dayActive: 1491, workouts: 1186, outside: 305, bmr: 1653, total: 3144, balance: -833, inconsistent: false });
});

test('sin basal hay desglose pero no gasto total ni balance', () => {
  const e = dayEnergy({ dayActive: 151, workouts: 0, bmr: null, eaten: 2162 });
  assert.equal(e.outside, 151);
  assert.equal(e.total, null);
  assert.equal(e.balance, null);
});

test('entrenamientos mayores que las activas del día se marcan', () => {
  const e = dayEnergy({ dayActive: 400, workouts: 500, bmr: 1650 });
  assert.equal(e.inconsistent, true);
  assert.equal(e.outside, 0);
});

test('basal del InBody vigente por fecha', () => {
  const scans = [{ day: '2026-06-15', metrics: {} }, { day: '2026-09-28', metrics: { bmr: 1653 } }, { day: '2026-11-20', metrics: { bmr: 1700 } }];
  assert.equal(bmrFor(scans, '2026-10-15'), 1653);
  assert.equal(bmrFor(scans, '2026-12-01'), 1700);
  assert.equal(bmrFor(scans, '2026-01-01'), 1653); // antes del primero: usa el primero con basal
  assert.equal(bmrFor([], '2026-10-15'), null);
});

test('etiquetas de balance y peso esperado', () => {
  assert.equal(balanceLabel(-610), 'déficit');
  assert.equal(balanceLabel(80), 'equilibrio');
  assert.equal(balanceLabel(350), 'superávit');
  assert.equal(expectedKg(-3850), -0.5);
});

test('resumen semanal: gasto = basal + activas del día; balance solo con comida y gasto', () => {
  const plans = [{ name: 'P', start_date: '2026-01-01', targets: {} }];
  const days = buildDays({
    entries: [
      { eaten_on: '2026-10-12', kcal: 2000, portions: {} },
      { eaten_on: '2026-10-13', kcal: 2200, portions: {} },
      { eaten_on: '2026-10-14', kcal: 1900, portions: {} },
    ],
    logs: [
      { day: '2026-10-12', water_ml: 0, day_active_kcal: 900 },
      { day: '2026-10-13', water_ml: 0, day_active_kcal: 700 },
      { day: '2026-10-15', water_ml: 0, day_active_kcal: 800 }, // sin comida: entra en gasto, no en balance
    ],
    activities: [{ day: '2026-10-12', active_kcal: 500 }],
    scans: [{ day: '2026-09-28', metrics: { bmr: 1600 } }],
  });
  assert.equal(days['2026-10-12'].totalKcal, 2500);
  assert.equal(days['2026-10-12'].outsideKcal, 400);
  const [w] = weeklySummary(days, plans, '2026-10-12', '2026-10-18');
  assert.equal(w.totalKcal, 2400); // (2500 + 2300 + 2400) / 3
  assert.equal(w.balance, -300); // (−500 − 100) / 2
  assert.equal(w.balanceDays, 2);
  assert.equal(w.expectedKg, expectedKg(-600));
});
