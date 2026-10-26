import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { similarExercises, nameSimilarity } from '../src/lib/exerciseMatch.js';

const catalog = JSON.parse(readFileSync(new URL('./fixtures/exercises.json', import.meta.url))).map((e, i) => ({ ...e, id: String(i) }));

test('detecta el mismo ejercicio escrito distinto', () => {
  assert.equal(nameSimilarity('Press de banca con mancuerna', 'press banca mancuernas'), 1);
  assert.equal(nameSimilarity('Sentadilla con barra', 'SENTADILLA CON BARRA'), 1);
  const r = similarExercises('Press banca con mancuernas', catalog);
  assert.equal(r[0].ex.name, 'Press de banca con mancuerna');
  assert.equal(r[0].exact, true);
});

test('sugiere parecidos sin marcarlos como iguales', () => {
  const r = similarExercises('Sentadilla búlgara', catalog);
  assert.ok(r.length > 0);
  assert.ok(r.every((x) => !x.exact));
});

test('no inventa parecidos para algo nuevo', () => {
  assert.deepEqual(similarExercises('Hip thrust con banda', catalog.filter((e) => !/hip thrust/i.test(e.name))).filter((x) => x.score > 0.8), []);
});
