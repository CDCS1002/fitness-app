/**
 * Metas de energía y macros del día.
 *
 * Si el plan no trae metas explícitas, se estiman a partir de las porciones con los
 * valores por porción de la lista de intercambio de la nutricionista: proteína magra
 * 45 kcal (7 P · 2 G), harina 80 (15 C · 3 P · 1 G), grasa 45 (5 G), lácteo descremado
 * 100 (12 C · 8 P · ~1,5 G), vegetal 25 (5 C · 2 P), fruta 60 (15 C).
 */
import { DEFAULT_GROUPS } from './portions.js';

// Valores por porción de la lista de la nutricionista: vienen de exchange_groups
// (portion_kcal, portion_protein…). DEFAULT_GROUPS solo cubre el arranque sin conexión.
const fromGroups = (groups) => Object.fromEntries(Object.entries(groups)
  .filter(([, g]) => g.portion_kcal != null)
  .map(([code, g]) => [code, { kcal: Number(g.portion_kcal), protein: Number(g.portion_protein || 0), carbs: Number(g.portion_carbs || 0), fat: Number(g.portion_fat || 0) }]));
let PORTION_VALUES = fromGroups(DEFAULT_GROUPS);

/** Actualiza los valores por porción con los grupos cargados de la base. */
export function setPortionValues(groups) {
  const v = fromGroups(groups || {});
  if (Object.keys(v).length) PORTION_VALUES = v;
}

export function estimateFromPortions(targets = {}, values = PORTION_VALUES) {
  const out = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const [g, n] of Object.entries(targets)) {
    const v = values[g];
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
