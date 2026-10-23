/**
 * Reporte para la cita de nutrición (misma estructura que la hoja "Reporte cita").
 * Los promedios son diarios sobre los días registrados del período (días con comida),
 * igual que en el Sheet. El día en curso se excluye porque aún va a medias.
 */
import { addDays, fromISO } from './dates.js';
import { GROUP_ORDER } from './portions.js';
import { expectedKg } from './energy.js';
const REPORT_GROUPS = [...GROUP_ORDER, 'azucar'];
import { waterTarget } from './activity.js';
import { groupsOnTarget, planFor, weeklySummary } from './weekly.js';
import { analyze, markFor } from './strength.js';
import { dayTargets } from './targets.js';

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const r = (n, d = 0) => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);
const diff = (v, t, d = 1) => (v == null || t == null ? null : r(v - t, d));

export function daysBetween(from, to) {
  return Math.round((fromISO(to) - fromISO(from)) / 864e5) + 1;
}

/**
 * @param {object} p
 *  days: salida de buildDays · plans · from/to (ISO) · exclude (ISO, opcional)
 *  strength (registros con exercise_id, day, weight_kg, sets) · exercises
 *  weightsAll (todo el historial de peso) · scans (InBody, ordenados por fecha)
 */
export function buildReport({ days, plans, from, to, exclude = null, strength = [], exercises = [], weightsAll = [], scans = [] }) {
  const plan = planFor(plans, to) || planFor(plans, from) || plans[0] || null;
  const targets = plan?.targets || {};
  const isos = [];
  for (let d = from; d <= to; d = addDays(d, 1)) if (d !== exclude) isos.push(d);
  const logged = isos.map((d) => days[d]).filter((d) => d && d.food);
  const of = (fn) => avg(logged.map(fn).filter((x) => x != null));

  // ---------- Alimentación ----------
  const kcalT = dayTargets(plan);
  const food = {
    kcal: r(of((d) => d.food.kcal)),
    protein: r(of((d) => d.food.protein)),
    carbs: r(of((d) => d.food.carbs)),
    fat: r(of((d) => d.food.fat)),
    kcalTarget: kcalT.kcal, kcalLow: kcalT.low, kcalHigh: kcalT.high, kcalEstimated: kcalT.estimated,
    proteinTarget: kcalT.protein, carbsTarget: kcalT.carbs, fatTarget: kcalT.fat,
    daysInRange: logged.filter((d) => d.food.kcal >= kcalT.low && d.food.kcal <= kcalT.high).length,
    portions: REPORT_GROUPS.map((g) => {
      const v = r(of((d) => Number(d.food.portions?.[g] || 0)), 1);
      const t = g === 'azucar' ? Number(targets.azucar ?? 1) : targets[g] != null ? Number(targets[g]) : null;
      return { group: g, avg: v, target: t, diff: diff(v, t) };
    }).filter((p) => p.group !== 'azucar' || p.avg > 0),
    allGroupsPct: logged.length
      ? r((logged.filter((d) => groupsOnTarget(d.food.portions, (planFor(plans, d.day) || plan)?.targets) === 6).length / logged.length) * 100)
      : null,
  };

  // ---------- Actividad, sueño e hidratación ----------
  const waterTargets = logged.map((d) => waterTarget(d.day, planFor(plans, d.day) || plan) / 1000);
  const waterL = r(of((d) => (d.waterMl ?? 0) / 1000), 2);
  const activity = {
    activeKcal: r(of((d) => d.activeKcal ?? 0)),
    totalKcal: r(avg(isos.map((d) => days[d]?.totalKcal).filter((x) => x != null))),
    balance: r(avg(logged.map((d) => d.balance).filter((x) => x != null))),
    balanceDays: logged.filter((d) => d.balance != null).length,
    expectedKg: (() => { const b = logged.map((d) => d.balance).filter((x) => x != null); return b.length ? expectedKg(b.reduce((a, x) => a + x, 0)) : null; })(),
    steps: r(of((d) => d.steps ?? 0)),
    stepsTarget: Number(plan?.steps_target ?? 10000),
    sleep: r(of((d) => d.sleep ?? null), 1),
    sleepTarget: Number(plan?.sleep_target ?? 8),
    energy: r(of((d) => d.energy ?? null), 1),
    waterL,
    waterTargetL: r(avg(waterTargets), 2),
    waterPct: r(of((d) => (d.waterMl ?? 0) / waterTarget(d.day, planFor(plans, d.day) || plan)) * 100),
  };
  activity.stepsDiff = diff(activity.steps, activity.stepsTarget, 0);
  activity.sleepDiff = diff(activity.sleep, activity.sleepTarget);
  activity.waterDiff = diff(activity.waterL, activity.waterTargetL, 2);

  // ---------- Peso ----------
  const ws = [...weightsAll].sort((a, b) => (a.day < b.day ? -1 : 1)).map((w) => ({ day: w.day, kg: Number(w.weight_kg) }));
  const inPeriod = ws.filter((w) => w.day >= from && w.day <= to);
  const before = ws.filter((w) => w.day < from).at(-1);
  const startW = before || inPeriod[0] || null;
  const lastW = inPeriod.at(-1) || null;
  const weight = {
    start: startW, last: lastW,
    change: startW && lastW ? r(lastW.kg - startW.kg, 1) : null,
  };

  // ---------- Fuerza ----------
  const exById = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const sIn = strength.filter((s) => s.day >= from && s.day <= to && s.day !== exclude)
    .sort((a, b) => (a.day < b.day ? -1 : 1));
  const progress = {};
  let up = 0;
  let volume = 0;
  for (const s of sIn) {
    const ex = exById[s.exercise_id];
    if (!ex) continue;
    const a = analyze(ex, s, null);
    if (a.action === 'subir') up += 1;
    if (a.volume) volume += a.volume;
    const m = markFor(ex, s.weight_kg, s.sets);
    const p = (progress[ex.id] ||= { name: ex.name, measure: ex.measure, first: m, last: m, sessions: 0 });
    p.last = m;
    p.sessions += 1;
  }
  const strengthR = {
    sessions: new Set(sIn.map((s) => s.day)).size,
    volume: Math.round(volume),
    upCount: up,
    entries: sIn.length,
    top: Object.values(progress)
      .filter((p) => p.sessions > 1 && p.first != null && p.last != null)
      .map((p) => ({ ...p, change: r(p.last - p.first, 1), pct: p.first > 0 ? r(((p.last - p.first) / p.first) * 100) : null }))
      .sort((a, b) => (b.pct ?? -1e9) - (a.pct ?? -1e9))
      .slice(0, 5),
  };

  // ---------- InBody ----------
  const inbody = { last: scans.at(-1) || null, previous: scans.at(-2) || null };

  return {
    plan,
    from, to,
    periodDays: daysBetween(from, to),
    loggedDays: logged.length,
    food, activity, weight, strength: strengthR, inbody,
    weeks: weeklySummary(days, plans, from, to, exclude).reverse().filter((w) => w.daysLogged || w.weight != null),
  };
}
