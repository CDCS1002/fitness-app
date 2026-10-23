import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markFor, volumeFor, actionFor, suggestedWeight, analyze } from '../src/lib/strength.js';

const leg = { measure: 'reps', body: 'inferior' };
const upper = { measure: 'reps', body: 'superior' };
const core = { measure: 'reps', body: 'core' };
const iso = { measure: 'segundos', body: 'core' };

// Casos tomados de la hoja Fuerza del Sheet (marca, volumen, acción, sugerido)
test('Prensa 160 kg × 8/10/10 → 213,3 · 4.480 · mantener · 160', () => {
  assert.equal(markFor(leg, 160, [8, 10, 10]), 213.3);
  assert.equal(volumeFor(leg, 160, [8, 10, 10]), 4480);
  assert.equal(actionFor(leg, [8, 10, 10]), 'mantener');
  assert.equal(suggestedWeight(leg, 160, [8, 10, 10]), 160);
});

test('Prensa 160 kg × 10/10/10 → subir a 165 (tren inferior +5)', () => {
  assert.equal(suggestedWeight(leg, 160, [10, 10, 10]), 165);
});

test('Extensión 36 kg × 10/12/10 → marca con la mejor serie 50,4 y subir a 41', () => {
  assert.equal(markFor(leg, 36, [10, 12, 10]), 50.4);
  assert.equal(suggestedWeight(leg, 36, [10, 12, 10]), 41);
});

test('Elevaciones 12,5 kg × 12 → subir a 15 (superior +2,5)', () => {
  assert.equal(suggestedWeight(upper, 12.5, [12, 12, 12]), 15);
});

test('Curl predicador 15 kg × 6/6/6 → mantener; con un 5 → bajar', () => {
  assert.equal(actionFor(upper, [6, 6, 6]), 'mantener');
  assert.equal(suggestedWeight(upper, 15, [6, 6, 5]), 12.5);
});

test('Crunch 36,2 kg × 25 → 66,4 y subir a 38,7', () => {
  assert.equal(markFor(core, 36.2, [25, 25, 25]), 66.4);
  assert.equal(suggestedWeight(core, 36.2, [25, 25, 25]), 38.7);
});

test('Plancha 70 s → marca 70, sin volumen, mantener (máximo 90 s)', () => {
  assert.equal(markFor(iso, 0, [70, 70, 70]), 70);
  assert.equal(volumeFor(iso, 0, [70, 70, 70]), null);
  assert.equal(actionFor(iso, [70, 70, 70]), 'mantener');
  assert.equal(suggestedWeight(iso, 0, [90, 95, 90]), 2.5);
});

test('Cambio de marca contra la sesión anterior', () => {
  const r = analyze(leg, { weight_kg: 55, sets: [10, 10, 10] }, { weight_kg: 36, sets: [10, 12, 10] });
  assert.equal(r.mark, 73.3);
  assert.equal(r.change, 22.9);
});
