/**
 * Gasto del día. El reloj da las kcal totales (reposo + todo el movimiento);
 * las de entrenamiento son la suma de las actividades registradas. La resta es
 * lo gastado fuera del entreno (metabolismo en reposo + caminar, trabajo, etc.).
 */
export const KCAL_PER_KG = 7700; // aproximación usual de 1 kg de peso corporal

/**
 * @param {object} p
 *  total: kcal totales del reloj (o null)
 *  workouts: kcal activas sumadas de las actividades
 *  eaten: kcal ingeridas (o null si no hay comida registrada)
 */
export function dayEnergy({ total, workouts = 0, eaten = null }) {
  const t = total == null || total === '' ? null : Number(total);
  const w = Math.round(Number(workouts) || 0);
  if (t == null) return { total: null, workouts: w, outside: null, balance: null, inconsistent: false };
  const tr = Math.round(t);
  return {
    total: tr,
    workouts: w,
    outside: Math.max(0, tr - w),
    balance: eaten == null ? null : Math.round(Number(eaten) - tr),
    // El total del reloj no puede ser menor que las kcal de los entrenamientos
    inconsistent: w > tr,
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
