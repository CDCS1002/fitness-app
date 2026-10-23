/**
 * Progresión de fuerza (doble progresión), igual que la hoja Fuerza del Sheet.
 *
 *  - Reps: rango 6–10. Si todas las series llegan a 10, sube la carga;
 *    si alguna queda por debajo de 6, bájala; si no, mantén el peso.
 *  - Isométricos (segundos): rango 30–90 con la misma regla.
 *  - Aumento: +5 kg en tren inferior, +2,5 kg en tren superior, core e isométricos.
 *  - Marca: 1RM estimado (Epley) con la mejor serie; en isométricos, la mejor serie.
 *  - Volumen: peso × total de reps (no aplica a isométricos).
 */
export const PROGRESSION = {
  reps: { min: 6, max: 10 },
  segundos: { min: 30, max: 90 },
  step: { inferior: 5, superior: 2.5, core: 2.5, isometrico: 2.5 },
};

const valid = (sets) => (sets || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
const r1 = (n) => Math.round(n * 10) / 10;

export function stepFor(ex) {
  if (ex.measure === 'segundos') return PROGRESSION.step.isometrico;
  return PROGRESSION.step[ex.body] ?? PROGRESSION.step.superior;
}

/** 1RM estimado (Epley) o mejor tiempo en isométricos. */
export function markFor(ex, weight, sets) {
  const s = valid(sets);
  if (!s.length) return null;
  const best = Math.max(...s);
  if (ex.measure === 'segundos') return best;
  return r1(Number(weight || 0) * (1 + best / 30));
}

export function volumeFor(ex, weight, sets) {
  if (ex.measure === 'segundos') return null;
  return Math.round(Number(weight || 0) * valid(sets).reduce((a, b) => a + b, 0));
}

/** 'subir' | 'mantener' | 'bajar' */
export function actionFor(ex, sets) {
  const s = valid(sets);
  if (!s.length) return null;
  const { min, max } = PROGRESSION[ex.measure] || PROGRESSION.reps;
  if (s.every((n) => n >= max)) return 'subir';
  if (s.some((n) => n < min)) return 'bajar';
  return 'mantener';
}

export function suggestedWeight(ex, weight, sets) {
  const a = actionFor(ex, sets);
  const w = Number(weight || 0);
  if (a === 'subir') return r1(w + stepFor(ex));
  if (a === 'bajar') return r1(Math.max(0, w - stepFor(ex)));
  return w;
}

export const ACTION_LABEL = { subir: 'Subir carga', mantener: 'Mantener peso', bajar: 'Bajar carga' };

/** Resumen de un registro: marca, volumen, acción y peso sugerido. */
export function analyze(ex, entry, previous) {
  const mark = markFor(ex, entry.weight_kg, entry.sets);
  const prevMark = previous ? markFor(ex, previous.weight_kg, previous.sets) : null;
  return {
    mark,
    prevMark,
    change: mark != null && prevMark != null ? r1(mark - prevMark) : null,
    volume: volumeFor(ex, entry.weight_kg, entry.sets),
    action: actionFor(ex, entry.sets),
    suggested: suggestedWeight(ex, entry.weight_kg, entry.sets),
  };
}

/** Ejercicios del día según su día habitual (ISO 1 = lunes). */
export function plannedFor(exercises, isoDow) {
  return exercises.filter((e) => !e.archived && (e.days || []).includes(isoDow));
}

export function fmtKg(n) {
  return n == null ? '—' : new Intl.NumberFormat('es', { maximumFractionDigits: 1 }).format(n);
}
