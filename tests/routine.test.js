import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exercisesForRoutine, inferRoutine, missingThisWeek, routineForDay, routinesInDay, isEveryDay } from '../src/lib/routine.js';

const exercises = JSON.parse(readFileSync(new URL('../supabase/seed/exercises.json', import.meta.url))).map((e) => ({ ...e, id: e.name }));
const history = JSON.parse(readFileSync(new URL('../supabase/seed/strength_history.json', import.meta.url)))
  .map((h) => ({ day: h.day, exercise_id: h.exercise }));
const week = (from, n) => Array.from({ length: n }, (_, i) => `2026-10-${String(Number(from) + i).padStart(2, '0')}`);

test('Rutina de pecho: sus ejercicios primero y abdomen al final', () => {
  const list = exercisesForRoutine(exercises, 4);
  assert.ok(list.some((e) => e.name === 'Press de banca con mancuerna'));
  assert.ok(list.some((e) => e.name === 'Crunch en polea'));
  const firstCore = list.findIndex(isEveryDay);
  assert.ok(list.slice(firstCore).every(isEveryDay));
  assert.ok(!list.some((e) => e.name === 'Prensa de piernas'));
});

test('Deduce la rutina de cada día del historial real', () => {
  const of = (day) => inferRoutine(exercises, history.filter((h) => h.day === day));
  assert.equal(of('2026-10-14'), 3); // miércoles: pierna
  // jueves 15/10: sesión mixta de pecho + bíceps/hombro → cubre ambas y el día queda como pecho
  assert.deepEqual([...routinesInDay(exercises, history.filter((h) => h.day === '2026-10-15'))].sort(), [2, 4]);
  assert.equal(routineForDay({ exercises, entries: history, day: '2026-10-15', dow: 4 }), 4);
  // lunes 19/10: full body no "completa" pecho aunque comparta press inclinado y patada de burro
  assert.deepEqual([...routinesInDay(exercises, history.filter((h) => h.day === '2026-10-19'))], [1]);
  assert.equal(of('2026-10-19'), 1); // lunes: full body
  assert.equal(of('2026-10-20'), 2); // martes: espalda
  assert.equal(of('2026-10-21'), 3); // miércoles: pierna
});

test('Viernes 23/10 sin pecho el jueves → sugiere Pecho', () => {
  const missing = missingThisWeek({ exercises, entries: history, weekDays: week('19', 5), todayDow: 5 });
  assert.deepEqual(missing, [4]);
});

test('Si hoy se registra pecho, ya no falta nada', () => {
  const today = [{ day: '2026-10-23', exercise_id: 'Press de banca con mancuerna' }, { day: '2026-10-23', exercise_id: 'Crunch en polea' }];
  const missing = missingThisWeek({ exercises, entries: [...history, ...today], weekDays: week('19', 5), todayDow: 5 });
  assert.deepEqual(missing, []);
  assert.equal(routineForDay({ exercises, entries: today, day: '2026-10-23', dow: 5 }), 4);
});

test('La elección manual manda; sin registros, la rutina habitual del día', () => {
  assert.equal(routineForDay({ exercises, entries: [], day: '2026-10-23', dow: 5, choice: 4 }), 4);
  assert.equal(routineForDay({ exercises, entries: [], day: '2026-10-23', dow: 5 }), 5);
  assert.equal(routineForDay({ exercises, entries: [], day: '2026-10-24', dow: 6 }), 0);
});
