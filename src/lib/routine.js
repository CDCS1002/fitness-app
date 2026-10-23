// Semana tipo (hoja Configuración del Sheet). ISO: 1 = lunes … 7 = domingo.
// Cada rutina se identifica con el día de la semana en que se hace habitualmente;
// sus ejercicios son los del catálogo que tienen ese día en `days`.
export const ROUTINE = {
  1: 'Full body + abdomen',
  2: 'Espalda, bíceps y hombro + abdomen',
  3: 'Pierna + abdomen',
  4: 'Pecho, tríceps y hombro + abdomen',
  5: 'Cardio + abdomen',
  6: 'Descanso',
  7: 'Descanso',
};
export const ROUTINES = [
  { key: 1, name: 'Full body', full: ROUTINE[1] },
  { key: 2, name: 'Espalda · Bíceps · Hombro', full: ROUTINE[2] },
  { key: 3, name: 'Pierna', full: ROUTINE[3] },
  { key: 4, name: 'Pecho · Tríceps · Hombro', full: ROUTINE[4] },
  { key: 5, name: 'Cardio', full: ROUTINE[5] },
  { key: 0, name: 'Descanso', full: 'Descanso' },
];
export const routineName = (key) => ROUTINES.find((r) => r.key === key)?.full || 'Descanso';

export const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const isoDow = (date) => ((date.getDay() + 6) % 7) + 1;

/** Ejercicios que se hacen todos los días de entreno (abdomen): no identifican una rutina. */
export const isEveryDay = (ex) => [1, 2, 3, 4, 5].every((d) => (ex.days || []).includes(d));

/** Ejercicios de una rutina: los propios primero y después los de todos los días. */
export function exercisesForRoutine(exercises, key) {
  if (!key) return [];
  const own = exercises.filter((e) => !e.archived && (e.days || []).includes(key));
  // Por grupo muscular, en el orden en que aparece cada grupo en el catálogo, y luego por nombre
  const order = [];
  for (const e of exercises) if (e.muscle && !order.includes(e.muscle)) order.push(e.muscle);
  const rank = (e) => (order.indexOf(e.muscle) + 1 || 999);
  const sorted = [...own].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return [...sorted.filter((e) => !isEveryDay(e)), ...sorted.filter(isEveryDay)];
}

/**
 * Rutina que corresponde a los ejercicios registrados un día: la que más ejercicios
 * propios comparte con ellos (los de abdomen no cuentan). null si no se puede saber.
 */
export function inferRoutine(exercises, dayEntries) {
  const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const score = {};
  for (const en of dayEntries) {
    const ex = byId[en.exercise_id];
    if (!ex || isEveryDay(ex)) continue;
    for (const d of ex.days || []) if (d >= 1 && d <= 5) score[d] = (score[d] || 0) + 1 / (ex.days.length || 1);
  }
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return best ? Number(best[0]) : null;
}

/**
 * Rutinas cubiertas en un día: la principal deducida y cualquier otra de la que se hayan
 * hecho al menos 2 ejercicios exclusivos (que solo se hacen en esa rutina). Así una sesión
 * mixta de pecho + bíceps cuenta para ambas, pero un full body no "completa" pecho.
 */
export function routinesInDay(exercises, dayEntries) {
  const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const out = new Set();
  const main = inferRoutine(exercises, dayEntries);
  if (main) out.add(main);
  const exclusive = {};
  for (const en of dayEntries) {
    const ex = byId[en.exercise_id];
    const days = (ex?.days || []).filter((d) => d >= 1 && d <= 5);
    if (days.length === 1) exclusive[days[0]] = (exclusive[days[0]] || 0) + 1;
  }
  for (const [d, n] of Object.entries(exclusive)) if (n >= 2) out.add(Number(d));
  return out;
}

/** Rutina de un día: la elegida, la deducida de lo registrado, o la habitual de ese día. */
export function routineForDay({ exercises, entries, day, dow, choice }) {
  if (choice != null) return choice;
  const dayEntries = entries.filter((e) => e.day === day);
  const covered = routinesInDay(exercises, dayEntries);
  if (covered.has(dow)) return dow; // sesión mixta: manda la rutina habitual del día
  const inferred = inferRoutine(exercises, dayEntries);
  if (inferred) return inferred;
  return dow <= 5 ? dow : 0;
}

/**
 * Rutinas de fuerza que tocaban antes de hoy en esta semana y aún no se hicieron.
 * weekDays: fechas ISO del lunes hasta hoy (incluido). Una rutina cuenta como hecha si
 * algún día de la semana se registraron ejercicios de ella (la elección manual de ese día
 * desempata). Cardio no se sugiere: no tiene ejercicios propios de fuerza.
 */
export function missingThisWeek({ exercises, entries, weekDays, todayDow, choices = {} }) {
  const done = new Set();
  for (const day of weekDays) {
    const dayEntries = entries.filter((e) => e.day === day);
    if (!dayEntries.length) continue;
    if (choices[day]) done.add(choices[day]);
    for (const r of routinesInDay(exercises, dayEntries)) done.add(r);
  }
  return ROUTINES
    .filter((r) => r.key >= 1 && r.key <= 4 && r.key < todayDow)
    .filter((r) => exercisesForRoutine(exercises, r.key).some((e) => !isEveryDay(e)))
    .filter((r) => !done.has(r.key))
    .map((r) => r.key);
}
