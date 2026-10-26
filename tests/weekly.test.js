import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildDays, weeklySummary, weekStart, groupsOnTarget } from '../src/lib/weekly.js';

const hist = JSON.parse(readFileSync(new URL('./fixtures/progress_history.json', import.meta.url)));
const exercises = JSON.parse(readFileSync(new URL('./fixtures/exercises.json', import.meta.url))).map((e) => ({ ...e, id: e.name }));
const strength = JSON.parse(readFileSync(new URL('./fixtures/strength_history.json', import.meta.url)))
  .map((s) => ({ day: s.day, exercise_id: s.exercise, weight_kg: s.weight, sets: s.sets }));
const plans = [{ name: 'Plan 1', start_date: '2026-09-28', end_date: null, water_train_ml: 3550, water_rest_ml: 2800, training_days: [1, 2, 3, 4, 5],
  targets: { proteina: 15, carbohidrato: 9, grasa: 3, lacteo: 2, vegetal: 3, fruta: 2 } }];
const days = buildDays({
  legacy: hist.days,
  logs: hist.days.map((d) => ({ day: d.day, water_ml: d.water_ml, steps: d.steps })),
  weights: hist.weights, strength, exercises,
});
const weeks = weeklySummary(days, plans, '2026-10-12', '2026-10-25');
const w12 = weeks.find((w) => w.week === '2026-10-12');
const w19 = weeks.find((w) => w.week === '2026-10-19');

test('Semana inicia en lunes', () => {
  assert.equal(weekStart('2026-10-18'), '2026-10-12');
  assert.equal(weekStart('2026-10-19'), '2026-10-19');
});

test('Semana del 12/10 igual a la hoja Semanal', () => {
  assert.equal(w12.daysLogged, 6);
  assert.equal(w12.kcal, 2079);
  assert.equal(w12.protein, 143);
  assert.equal(w12.groupsOnTarget, 4);
  assert.equal(w12.activeKcal, 543);
  assert.equal(w12.steps, 8065);
  assert.equal(w12.waterL, 2.33);
  assert.equal(w12.waterPct, 70);
  assert.equal(w12.sleep, 7.1);
  assert.equal(w12.strengthSessions, 3);
});

test('Semana del 19/10 igual a la hoja Semanal', () => {
  assert.equal(w19.daysLogged, 3);
  assert.equal(w19.kcal, 1998);
  assert.equal(w19.activeKcal, 815);
  assert.equal(w19.steps, 9459);
  assert.equal(w19.weight, 78.7);
  assert.equal(w19.strengthSessions, 3);
});

test('Volumen de fuerza por semana', () => {
  console.log('volumen', w12.strengthVolume, w19.strengthVolume);
  assert.ok(w12.strengthVolume > 0 && w19.strengthVolume > 0);
});

test('Grupos en meta', () => {
  const t = { proteina: 15, carbohidrato: 9, grasa: 3, lacteo: 2, vegetal: 3, fruta: 2 };
  assert.equal(groupsOnTarget({ lacteo: 1, vegetal: 2, fruta: 2, carbohidrato: 9, proteina: 15, grasa: 3 }, t), 4);
});

test('El día en curso no entra en los promedios', () => {
  const d = buildDays({ legacy: hist.days, entries: [{ eaten_on: '2026-10-22', kcal: 130, protein: 25, carbs: 3, fat: 2, portions: { proteina: 3.5 } }] });
  const w = weeklySummary(d, plans, '2026-10-19', '2026-10-22', '2026-10-22').find((x) => x.week === '2026-10-19');
  assert.equal(w.daysLogged, 3);
  assert.equal(w.kcal, 1998);
});
