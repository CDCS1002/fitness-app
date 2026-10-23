import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildDays } from '../src/lib/weekly.js';
import { buildReport } from '../src/lib/report.js';

const read = (f) => JSON.parse(readFileSync(new URL(`../supabase/seed/${f}`, import.meta.url)));
const hist = read('progress_history.json');
const exercises = read('exercises.json').map((e) => ({ ...e, id: e.name }));
const strength = read('strength_history.json').map((s) => ({ day: s.day, exercise_id: s.exercise, weight_kg: s.weight, sets: s.sets }));
const plans = [{ name: 'Plan 1', start_date: '2026-09-28', end_date: null, water_train_ml: 3550, water_rest_ml: 2800, training_days: [1, 2, 3, 4, 5],
  steps_target: 10000, sleep_target: 8, targets: { proteina: 15, carbohidrato: 9, grasa: 3, lacteo: 2, vegetal: 3, fruta: 2 } }];
const days = buildDays({
  legacy: hist.days, logs: hist.days.map((d) => ({ day: d.day, water_ml: d.water_ml, steps: d.steps })),
  weights: hist.weights, strength, exercises,
});
const rep = buildReport({ days, plans, from: '2026-09-28', to: '2026-10-22', exclude: '2026-10-22', strength, exercises, weightsAll: hist.weights, scans: hist.scans });
const por = Object.fromEntries(rep.food.portions.map((p) => [p.group, p]));

// Valores de la hoja "Reporte cita" del Sheet
test('Período y días registrados', () => {
  assert.equal(rep.periodDays, 25);
  assert.equal(rep.loggedDays, 9);
});

test('Alimentación igual al Sheet', () => {
  assert.deepEqual([rep.food.kcal, rep.food.protein, rep.food.carbs, rep.food.fat], [2052, 142, 202, 73]);
  assert.deepEqual([por.lacteo.avg, por.vegetal.avg, por.fruta.avg, por.carbohidrato.avg, por.proteina.avg, por.grasa.avg], [1, 1.4, 1.3, 9, 14.4, 3]);
  assert.equal(por.vegetal.diff, -1.6);
  assert.equal(rep.food.allGroupsPct, 0);
});

test('Actividad, sueño y agua igual al Sheet', () => {
  assert.equal(rep.activity.activeKcal, 633);
  assert.equal(rep.activity.steps, 8530);
  assert.equal(rep.activity.stepsDiff, -1470);
  assert.equal(rep.activity.sleep, 6.8);
  assert.equal(rep.activity.energy, 3.9);
  assert.equal(rep.activity.waterL, 2.33);
  assert.equal(rep.activity.waterPct, 69);
});

test('Peso y fuerza igual al Sheet', () => {
  assert.equal(rep.weight.last.kg, 78.7);
  assert.equal(rep.weight.change, 0);
  assert.equal(rep.strength.sessions, 6);
  assert.equal(rep.strength.volume, 48609);
  console.log('subir carga', rep.strength.upCount, '· top', rep.strength.top.map((t) => `${t.name} ${t.pct}%`).join(', '));
});

test('InBody: última frente a anterior', () => {
  assert.equal(rep.inbody.last.day, '2026-09-28');
  assert.equal(rep.inbody.previous.day, '2026-06-15');
});
