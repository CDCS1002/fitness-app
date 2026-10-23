/**
 * Resumen semanal (lunes a domingo), con la misma lógica que la hoja Semanal:
 * los promedios son diarios sobre los días registrados (días con comida
 * registrada en la app o importada del Sheet); fuerza es el total de la semana.
 */
import { addDays, fromISO, toISO } from './dates.js';
import { sumRoundedPortions, GROUP_ORDER } from './portions.js';
import { waterTarget } from './activity.js';
import { expectedKg, bmrFor } from './energy.js';

export function weekStart(iso) {
  const d = fromISO(iso);
  const dow = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - dow);
  return toISO(d);
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const r = (n, d = 0) => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);

/** Grupos que quedaron exactamente en la meta (redondeado a medias porciones). */
export function groupsOnTarget(portions, targets) {
  return GROUP_ORDER.filter((g) => Number(targets?.[g] || 0) > 0 && Math.round((portions[g] || 0) * 2) / 2 === Number(targets[g])).length;
}

/**
 * Arma los días a partir de las tablas.
 * @returns {Record<string, object>} por fecha ISO
 */
export function buildDays({ entries = [], legacy = [], logs = [], activities = [], strength = [], exercises = [], weights = [], scans = [] }) {
  const days = {};
  const day = (iso) => (days[iso] ||= { day: iso, entries: [], activeKcal: null, strengthVolume: 0, strengthSets: 0 });
  for (const e of entries) day(e.eaten_on).entries.push(e);
  for (const l of legacy) Object.assign(day(l.day), { legacy: l });
  for (const l of logs) {
    const d = Object.assign(day(l.day), { waterMl: Number(l.water_ml || 0), steps: l.steps });
    if (l.sleep_h != null) d.sleep = Number(l.sleep_h);
    if (l.energy != null) d.energy = Number(l.energy);
    if (l.day_active_kcal != null) d.dayActive = Number(l.day_active_kcal);
  }
  for (const a of activities) {
    const d = day(a.day);
    d.activeKcal = (d.activeKcal || 0) + Number(a.active_kcal || 0);
  }
  const byId = Object.fromEntries(exercises.map((x) => [x.id, x]));
  for (const s of strength) {
    const d = day(s.day);
    d.strengthSets += 1;
    if (byId[s.exercise_id]?.measure !== 'segundos') {
      d.strengthVolume += Number(s.weight_kg) * s.sets.reduce((a, b) => a + Number(b), 0);
    }
  }
  for (const w of weights) day(w.day).weight = Number(w.weight_kg);

  for (const d of Object.values(days)) {
    if (d.entries.length) {
      const sum = (k) => d.entries.reduce((a, e) => a + Number(e[k] || 0), 0);
      d.food = { kcal: sum('kcal'), protein: sum('protein'), carbs: sum('carbs'), fat: sum('fat'), portions: sumRoundedPortions(d.entries) };
    } else if (d.legacy && d.legacy.kcal != null) {
      const l = d.legacy;
      d.food = { kcal: +l.kcal, protein: +l.protein, carbs: +l.carbs, fat: +l.fat, portions: l.portions || {} };
    }
    if (d.activeKcal == null && d.legacy?.active_kcal != null) d.activeKcal = Number(d.legacy.active_kcal);
    if (d.sleep == null && d.legacy?.sleep_h != null) d.sleep = Number(d.legacy.sleep_h);
    if (d.energy == null && d.legacy?.energy != null) d.energy = Number(d.legacy.energy);
    // Gasto total = basal del InBody vigente + activas del día del reloj
    if (d.dayActive != null) {
      d.outsideKcal = Math.max(0, d.dayActive - (d.activeKcal || 0));
      const bmr = bmrFor(scans, d.day);
      if (bmr != null) d.totalKcal = bmr + d.dayActive;
    }
    // Balance del día: solo con comida y gasto total
    if (d.food && d.totalKcal != null) d.balance = d.food.kcal - d.totalKcal;
  }
  return days;
}

/** Plan vigente en una fecha. */
export function planFor(plans, iso) {
  return [...plans].sort((a, b) => (a.start_date < b.start_date ? 1 : -1))
    .find((p) => p.start_date <= iso && (!p.end_date || p.end_date >= iso)) || null;
}

/**
 * Semanas desde `from` hasta `to` (ambas incluidas), de la más reciente a la más antigua.
 * `exclude`: fecha que no entra en los promedios (el día en curso, que aún va a medias).
 */
export function weeklySummary(days, plans, from, to, exclude = null) {
  const weeks = [];
  for (let w = weekStart(from); w <= to; w = addDays(w, 7)) {
    const isos = Array.from({ length: 7 }, (_, i) => addDays(w, i));
    const ds = isos.filter((iso) => iso !== exclude).map((iso) => days[iso]).filter(Boolean);
    const logged = ds.filter((d) => d.food);
    const plan = planFor(plans, w) || planFor(plans, isos[6]);
    const weightsW = ds.filter((d) => d.weight != null).map((d) => d.weight);

    const of = (fn) => avg(logged.map(fn).filter((x) => x != null));
    const withTotal = ds.filter((d) => d.totalKcal != null);
    const withBalance = ds.filter((d) => d.balance != null);
    weeks.push({
      week: w,
      plan: plan?.name || null,
      daysLogged: logged.length,
      kcal: r(of((d) => d.food.kcal)),
      protein: r(of((d) => d.food.protein)),
      carbs: r(of((d) => d.food.carbs)),
      fat: r(of((d) => d.food.fat)),
      groupsOnTarget: r(of((d) => groupsOnTarget(d.food.portions, (planFor(plans, d.day) || plan)?.targets)), 1),
      activeKcal: r(of((d) => d.activeKcal ?? 0)),
      totalKcal: r(avg(withTotal.map((d) => d.totalKcal))),
      balance: r(avg(withBalance.map((d) => d.balance))),
      balanceDays: withBalance.length,
      expectedKg: withBalance.length ? expectedKg(withBalance.reduce((a, d) => a + d.balance, 0)) : null,
      steps: r(of((d) => d.steps ?? 0)),
      waterL: r(of((d) => (d.waterMl ?? 0) / 1000), 2),
      waterPct: r(of((d) => (d.waterMl ?? 0) / waterTarget(d.day, planFor(plans, d.day) || plan)) * 100),
      sleep: r(of((d) => d.sleep ?? null), 1),
      energy: r(of((d) => d.energy ?? null), 1),
      weight: weightsW.length ? r(avg(weightsW), 1) : null,
      strengthSessions: ds.filter((d) => d.strengthSets > 0).length,
      strengthVolume: Math.round(ds.reduce((a, d) => a + d.strengthVolume, 0)),
    });
  }
  // Cambio de peso contra la última semana con peso
  let lastWeight = null;
  for (const wk of weeks) {
    wk.weightChange = wk.weight != null && lastWeight != null ? r(wk.weight - lastWeight, 1) : null;
    if (wk.weight != null) lastWeight = wk.weight;
  }
  return weeks.reverse();
}
