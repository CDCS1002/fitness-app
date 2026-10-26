import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exercisesForRoutine, inferRoutine, missingThisWeek, routineForDay, routinesInDay, isEveryDay as everyDay, makeRoutines } from '../src/lib/routine.js';

// Tu semana tal como la copia la migración 0021 (antes estaba en el código)
const rt = makeRoutines([
  { weekday: 1, name: 'Full body', full_name: 'Full body + abdomen', is_rest: false },
  { weekday: 2, name: 'Espalda · Bíceps · Hombro', full_name: 'Espalda, bíceps y hombro + abdomen', is_rest: false },
  { weekday: 3, name: 'Pierna', full_name: 'Pierna + abdomen', is_rest: false },
  { weekday: 4, name: 'Pecho · Tríceps · Hombro', full_name: 'Pecho, tríceps y hombro + abdomen', is_rest: false },
  { weekday: 5, name: 'Cardio', full_name: 'Cardio + abdomen', is_rest: false },
  { weekday: 6, name: 'Descanso', full_name: 'Descanso', is_rest: true },
  { weekday: 7, name: 'Descanso', full_name: 'Descanso', is_rest: true },
]);
const isEveryDay = (e) => everyDay(e, rt);

const exercises = JSON.parse(readFileSync(new URL('./fixtures/exercises.json', import.meta.url))).map((e) => ({ ...e, id: e.name }));
const history = JSON.parse(readFileSync(new URL('./fixtures/strength_history.json', import.meta.url)))
  .map((h) => ({ day: h.day, exercise_id: h.exercise }));
const week = (from, n) => Array.from({ length: n }, (_, i) => `2026-10-${String(Number(from) + i).padStart(2, '0')}`);

test('Rutina de pecho: sus ejercicios primero y abdomen al final', () => {
  const list = exercisesForRoutine(exercises, 4, rt);
  assert.ok(list.some((e) => e.name === 'Press de banca con mancuerna'));
  assert.ok(list.some((e) => e.name === 'Crunch en polea'));
  const firstCore = list.findIndex(isEveryDay);
  assert.ok(list.slice(firstCore).every(isEveryDay));
  assert.ok(!list.some((e) => e.name === 'Prensa de piernas'));
});

test('Deduce la rutina de cada día del historial real', () => {
  const of = (day) => inferRoutine(exercises, history.filter((h) => h.day === day), rt);
  assert.equal(of('2026-10-14'), 3); // miércoles: pierna
  // jueves 15/10: sesión mixta de pecho + bíceps/hombro → cubre ambas y el día queda como pecho
  assert.deepEqual([...routinesInDay(exercises, history.filter((h) => h.day === '2026-10-15'), rt)].sort(), [2, 4]);
  assert.equal(routineForDay({ exercises, entries: history, day: '2026-10-15', dow: 4, rt }), 4);
  // lunes 19/10: full body no "completa" pecho aunque comparta press inclinado y patada de burro
  assert.deepEqual([...routinesInDay(exercises, history.filter((h) => h.day === '2026-10-19'), rt)], [1]);
  assert.equal(of('2026-10-19'), 1); // lunes: full body
  assert.equal(of('2026-10-20'), 2); // martes: espalda
  assert.equal(of('2026-10-21'), 3); // miércoles: pierna
});

test('Viernes 23/10 sin pecho el jueves → sugiere Pecho', () => {
  const missing = missingThisWeek({ exercises, entries: history, weekDays: week('19', 5), todayDow: 5, rt });
  assert.deepEqual(missing, [4]);
});

test('Si hoy se registra pecho, ya no falta nada', () => {
  const today = [{ day: '2026-10-23', exercise_id: 'Press de banca con mancuerna' }, { day: '2026-10-23', exercise_id: 'Crunch en polea' }];
  const missing = missingThisWeek({ exercises, entries: [...history, ...today], weekDays: week('19', 5), todayDow: 5, rt });
  assert.deepEqual(missing, []);
  assert.equal(routineForDay({ exercises, entries: today, day: '2026-10-23', dow: 5, rt }), 4);
});

test('La elección manual manda; sin registros, la rutina habitual del día', () => {
  assert.equal(routineForDay({ exercises, entries: [], day: '2026-10-23', dow: 5, choice: 4, rt }), 4);
  assert.equal(routineForDay({ exercises, entries: [], day: '2026-10-23', dow: 5, rt }), 5);
  assert.equal(routineForDay({ exercises, entries: [], day: '2026-10-24', dow: 6, rt }), 0);
});

test('Rutina de otro usuario: días y nombres propios, abdomen = lo que está en todos sus días', () => {
  const her = makeRoutines([
    { weekday: 1, name: 'Glúteo', full_name: 'Glúteo y pierna', is_rest: false },
    { weekday: 3, name: 'Torso', full_name: 'Torso', is_rest: false },
    { weekday: 5, name: 'Glúteo', full_name: 'Glúteo y femoral', is_rest: false },
  ]);
  assert.deepEqual(her.trainingDays, [1, 3, 5]);
  assert.equal(her.habitual(2), 0);
  assert.equal(her.name(5), 'Glúteo y femoral');
  const ex = [
    { id: 'ht', name: 'Hip thrust', muscle: 'Glúteo', days: [1, 5] },
    { id: 'pl', name: 'Plancha', muscle: 'Core', days: [1, 3, 5] },
    { id: 'rm', name: 'Remo', muscle: 'Espalda', days: [3] },
  ];
  assert.deepEqual(exercisesForRoutine(ex, 1, her).map((e) => e.id), ['ht', 'pl']);
  assert.equal(inferRoutine(ex, [{ exercise_id: 'rm' }, { exercise_id: 'pl' }], her), 3);
  // Miércoles sin torso el lunes→ no falta nada de días anteriores salvo lo no hecho
  assert.deepEqual(missingThisWeek({ exercises: ex, entries: [], weekDays: ['2026-10-26', '2026-10-27', '2026-10-28'], todayDow: 3, rt: her }), [1]);
});

test('Sin rutina cargada: todo es descanso y no truena', () => {
  const none = makeRoutines([]);
  assert.equal(routineForDay({ exercises: [], entries: [], day: '2026-10-26', dow: 1, rt: none }), 0);
  assert.deepEqual(missingThisWeek({ exercises: [], entries: [], weekDays: [], todayDow: 1, rt: none }), []);
});
