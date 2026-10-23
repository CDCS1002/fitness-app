/**
 * Gasto del día.
 * - El reloj da las kcal activas de TODO el día (anillo Moverse): entrenamientos + el resto
 *   del movimiento, sin el reposo.
 * - Las kcal de entrenamiento son la suma de las actividades registradas.
 * - El reposo sale de la tasa metabólica basal del InBody vigente en esa fecha.
 *   fuera del entreno = activas del día − entrenamientos
 *   gasto total       = basal + activas del día
 */
export const KCAL_PER_KG = 7700; // aproximación usual de 1 kg de peso corporal

/** Tasa metabólica basal del InBody vigente en una fecha (el último antes o ese día; si no hay, el primero). */
export function bmrFor(scans = [], iso) {
  const withBmr = scans.filter((s) => s.metrics?.bmr != null).sort((a, b) => (a.day < b.day ? -1 : 1));
  if (!withBmr.length) return null;
  const s = [...withBmr].reverse().find((x) => x.day <= iso) || withBmr[0];
  return Number(s.metrics.bmr);
}

/**
 * @param {object} p
 *  dayActive: kcal activas del día del reloj (o null)
 *  workouts: kcal activas sumadas de las actividades
 *  bmr: tasa metabólica basal (o null)
 *  eaten: kcal ingeridas (o null si no hay comida registrada)
 */
export function dayEnergy({ dayActive, workouts = 0, bmr = null, eaten = null }) {
  const a = dayActive == null || dayActive === '' ? null : Math.round(Number(dayActive));
  const w = Math.round(Number(workouts) || 0);
  const b = bmr == null ? null : Math.round(Number(bmr));
  if (a == null) return { dayActive: null, workouts: w, outside: null, bmr: b, total: null, balance: null, inconsistent: false };
  const total = b == null ? null : b + a;
  return {
    dayActive: a,
    workouts: w,
    outside: Math.max(0, a - w),
    bmr: b,
    total,
    balance: eaten == null || total == null ? null : Math.round(Number(eaten) - total),
    // Las activas del día incluyen los entrenamientos: no pueden ser menores
    inconsistent: w > a,
  };
}

/** Texto corto del balance: déficit, superávit o equilibrio (±100 kcal). */
export function balanceLabel(b) {
  if (b == null) return null;
  if (Math.abs(b) <= 100) return 'equilibrio';
  return b < 0 ? 'déficit' : 'superávit';
}

/** Cambio de peso que correspondería a un balance acumulado (kg, 2 decimales). */
export function expectedKg(sumBalance) {
  if (sumBalance == null) return null;
  return Math.round((sumBalance / KCAL_PER_KG) * 100) / 100;
}
