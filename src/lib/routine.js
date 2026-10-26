// La semana de rutinas de cada usuario vive en la base (tabla routines): una rutina por día
// ISO (1 = lunes … 7 = domingo). Sus ejercicios son los que tienen ese día en `days`
// (preferencias del usuario sobre el catálogo común). Aquí solo está la lógica.

/**
 * Arma la configuración de rutinas a partir de las filas de la base.
 * @param rows [{ weekday, name, full_name, is_rest }]
 */
export function makeRoutines(rows = []) {
  const byDay = Object.fromEntries(rows.map((r) => [Number(r.weekday), r]));
  const training = rows.filter((r) => !r.is_rest).map((r) => Number(r.weekday)).sort((a, b) => a - b);
  const list = [
    ...training.map((d) => ({ key: d, name: byDay[d].name, full: byDay[d].full_name || byDay[d].name })),
    { key: 0, name: 'Descanso', full: 'Descanso' },
  ];
  return {
    rows,
    list,
    trainingDays: training,
    isTraining: (d) => training.includes(Number(d)),
    name: (key) => list.find((r) => r.key === key)?.full || 'Descanso',
    short: (key) => list.find((r) => r.key === key)?.name || 'Descanso',
    habitual: (dow) => (training.includes(Number(dow)) ? Number(dow) : 0),
  };
}

export const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const isoDow = (date) => ((date.getDay() + 6) % 7) + 1;

/** Ejercicios que se hacen todos los días de entreno (abdomen): no identifican una rutina. */
export const isEveryDay = (ex, rt) => rt.trainingDays.length > 1 && rt.trainingDays.every((d) => (ex.days || []).includes(d));

/** Ejercicios de una rutina: los propios primero y después los de todos los días. */
export function exercisesForRoutine(exercises, key, rt) {
  if (!key) return [];
  const own = exercises.filter((e) => !e.archived && (e.days || []).includes(key));
  // Por grupo muscular, en el orden en que aparece cada grupo en el catálogo, y luego por nombre
  const order = [];
  for (const e of exercises) if (e.muscle && !order.includes(e.muscle)) order.push(e.muscle);
  const rank = (e) => (order.indexOf(e.muscle) + 1 || 999);
  const sorted = [...own].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return [...sorted.filter((e) => !isEveryDay(e, rt)), ...sorted.filter((e) => isEveryDay(e, rt))];
}

/**
 * Rutina que corresponde a los ejercicios registrados un día: la que más ejercicios
 * propios comparte con ellos (los de abdomen no cuentan). null si no se puede saber.
 */
export function inferRoutine(exercises, dayEntries, rt) {
  const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const score = {};
  for (const en of dayEntries) {
    const ex = byId[en.exercise_id];
    if (!ex || isEveryDay(ex, rt)) continue;
    for (const d of ex.days || []) if (rt.isTraining(d)) score[d] = (score[d] || 0) + 1 / (ex.days.length || 1);
  }
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return best ? Number(best[0]) : null;
}

/**
 * Rutinas cubiertas en un día: la principal deducida y cualquier otra de la que se hayan
 * hecho al menos 2 ejercicios exclusivos (que solo se hacen en esa rutina). Así una sesión
 * mixta de pecho + bíceps cuenta para ambas, pero un full body no "completa" pecho.
 */
export function routinesInDay(exercises, dayEntries, rt) {
  const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const out = new Set();
  const main = inferRoutine(exercises, dayEntries, rt);
  if (main) out.add(main);
  const exclusive = {};
  for (const en of dayEntries) {
    const ex = byId[en.exercise_id];
    const days = (ex?.days || []).filter((d) => rt.isTraining(d));
    if (days.length === 1) exclusive[days[0]] = (exclusive[days[0]] || 0) + 1;
  }
  for (const [d, n] of Object.entries(exclusive)) if (n >= 2) out.add(Number(d));
  return out;
}

/** Rutina de un día: la elegida, la deducida de lo registrado, o la habitual de ese día. */
export function routineForDay({ exercises, entries, day, dow, choice, rt }) {
  if (choice != null) return choice;
  const dayEntries = entries.filter((e) => e.day === day);
  const covered = routinesInDay(exercises, dayEntries, rt);
  if (covered.has(dow)) return dow; // sesión mixta: manda la rutina habitual del día
  const inferred = inferRoutine(exercises, dayEntries, rt);
  if (inferred) return inferred;
  return rt.habitual(dow);
}

/**
 * Rutinas de fuerza que tocaban antes de hoy en esta semana y aún no se hicieron.
 * weekDays: fechas ISO del lunes hasta hoy (incluido). Una rutina cuenta como hecha si
 * algún día de la semana se registraron ejercicios de ella (la elección manual de ese día
 * desempata). Cardio no se sugiere: no tiene ejercicios propios de fuerza.
 */
export function missingThisWeek({ exercises, entries, weekDays, todayDow, choices = {}, rt }) {
  const done = new Set();
  for (const day of weekDays) {
    const dayEntries = entries.filter((e) => e.day === day);
    if (!dayEntries.length) continue;
    if (choices[day]) done.add(choices[day]);
    for (const r of routinesInDay(exercises, dayEntries, rt)) done.add(r);
  }
  return rt.list
    .filter((r) => r.key >= 1 && r.key < todayDow)
    .filter((r) => exercisesForRoutine(exercises, r.key, rt).some((e) => !isEveryDay(e, rt)))
    .filter((r) => !done.has(r.key))
    .map((r) => r.key);
}
