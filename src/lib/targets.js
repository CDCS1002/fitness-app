/**
 * Metas de energía y macros del día.
 *
 * Si el plan no trae metas explícitas, se estiman a partir de las porciones con los
 * valores por porción de la lista de intercambio de la nutricionista: proteína magra
 * 45 kcal (7 P · 2 G), harina 80 (15 C · 3 P · 1 G), grasa 45 (5 G), lácteo descremado
 * 100 (12 C · 8 P · ~1,5 G), vegetal 25 (5 C · 2 P), fruta 60 (15 C).
 */
export const KCAL_PER_PORTION = {
  proteina:     { kcal: 45,  protein: 7, carbs: 0,  fat: 2 },
  carbohidrato: { kcal: 80,  protein: 3, carbs: 15, fat: 1 },
  grasa:        { kcal: 45,  protein: 0, carbs: 0,  fat: 5 },
  lacteo:       { kcal: 100, protein: 8, carbs: 12, fat: 1.5 },
  vegetal:      { kcal: 25,  protein: 2, carbs: 5,  fat: 0 },
  fruta:        { kcal: 60,  protein: 0, carbs: 15, fat: 0 },
};

export function estimateFromPortions(targets = {}) {
  const out = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const [g, n] of Object.entries(targets)) {
    const v = KCAL_PER_PORTION[g];
    if (!v) continue;
    for (const k of Object.keys(out)) out[k] += v[k] * Number(n || 0);
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Math.round(v)]));
}

/** Metas efectivas del día: las del plan, o la estimación por porciones. */
export function dayTargets(plan) {
  const est = estimateFromPortions(plan?.targets);
  const pick = (v, e) => (v == null || v === '' ? e : Number(v));
  const kcal = pick(plan?.kcal_target, est.kcal);
  const tol = Number(plan?.kcal_tolerance_pct ?? 10) / 100;
  return {
    kcal,
    low: Math.round(kcal * (1 - tol)),
    high: Math.round(kcal * (1 + tol)),
    protein: pick(plan?.protein_target, est.protein),
    carbs: pick(plan?.carbs_target, est.carbs),
    fat: pick(plan?.fat_target, est.fat),
    estimated: plan?.kcal_target == null,
    estimate: est,
  };
}

const fmt = (n) => new Intl.NumberFormat('es', { useGrouping: 'always' }).format(Math.round(n));

/** Estado del día frente al rango. */
export function kcalStatus(eaten, t) {
  if (eaten < t.low) return { state: 'under', text: `Faltan ${fmt(t.low - eaten)} kcal para entrar al rango` };
  if (eaten <= t.high) {
    const left = t.high - eaten;
    return { state: 'in', text: left > 0 ? `En rango · margen de ${fmt(left)} kcal` : 'En rango · justo en el límite' };
  }
  return { state: 'over', text: `Te pasaste ${fmt(eaten - t.high)} kcal del rango` };
}
