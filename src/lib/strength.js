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
/** Reglas por defecto para un usuario nuevo; las de cada usuario viven en strength_settings. */
export const DEFAULT_PROGRESSION = {
  reps: { min: 6, max: 10 },
  segundos: { min: 30, max: 90 },
  step: { inferior: 5, superior: 2.5, core: 2.5, isometrico: 2.5 },
};

/** Reglas a partir de la fila de strength_settings (o las de por defecto). */
export function progressionFrom(row) {
  if (!row) return DEFAULT_PROGRESSION;
  const n = (v, d) => (v == null || v === '' ? d : Number(v));
  const D = DEFAULT_PROGRESSION;
  return {
    reps: { min: n(row.reps_min, D.reps.min), max: n(row.reps_max, D.reps.max) },
    segundos: { min: n(row.secs_min, D.segundos.min), max: n(row.secs_max, D.segundos.max) },
    step: {
      inferior: n(row.step_inferior, D.step.inferior), superior: n(row.step_superior, D.step.superior),
      core: n(row.step_core, D.step.core), isometrico: n(row.step_isometrico, D.step.isometrico),
    },
  };
}

const valid = (sets) => (sets || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
const r1 = (n) => Math.round(n * 10) / 10;

export function stepFor(ex, P = DEFAULT_PROGRESSION) {
  if (ex.measure === 'segundos') return P.step.isometrico;
  return P.step[ex.body] ?? P.step.superior;
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
export function actionFor(ex, sets, P = DEFAULT_PROGRESSION) {
  const s = valid(sets);
  if (!s.length) return null;
  const { min, max } = P[ex.measure] || P.reps;
  if (s.every((n) => n >= max)) return 'subir';
  if (s.some((n) => n < min)) return 'bajar';
  return 'mantener';
}

export function suggestedWeight(ex, weight, sets, P = DEFAULT_PROGRESSION) {
  const a = actionFor(ex, sets, P);
  const w = Number(weight || 0);
  if (a === 'subir') return r1(w + stepFor(ex, P));
  if (a === 'bajar') return r1(Math.max(0, w - stepFor(ex, P)));
  return w;
}

export const ACTION_LABEL = { subir: 'Subir carga', mantener: 'Mantener peso', bajar: 'Bajar carga' };

/** Resumen de un registro: marca, volumen, acción y peso sugerido. */
export function analyze(ex, entry, previous, P = DEFAULT_PROGRESSION) {
  const mark = markFor(ex, entry.weight_kg, entry.sets);
  const prevMark = previous ? markFor(ex, previous.weight_kg, previous.sets) : null;
  return {
    mark,
    prevMark,
    change: mark != null && prevMark != null ? r1(mark - prevMark) : null,
    volume: volumeFor(ex, entry.weight_kg, entry.sets),
    action: actionFor(ex, entry.sets, P),
    suggested: suggestedWeight(ex, entry.weight_kg, entry.sets, P),
  };
}

/** Ejercicios del día según su día habitual (ISO 1 = lunes). */
export function plannedFor(exercises, isoDow) {
  return exercises.filter((e) => !e.archived && (e.days || []).includes(isoDow));
}

export function fmtKg(n) {
  return n == null ? '—' : new Intl.NumberFormat('es', { maximumFractionDigits: 1 }).format(n);
}
