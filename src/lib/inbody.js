/**
 * Indicadores del InBody (los mismos de la hoja InBody del Sheet).
 * better: 'up' si conviene que suba, 'down' si conviene que baje, null si es neutro.
 * key: clave en inbody_scans.metrics. main: aparece en el formulario rápido.
 * Los rangos de referencia dependen de cada persona (sexo, talla, peso): se guardan
 * por medición en inbody_scans.refs, no aquí.
 */
export const INBODY_SECTIONS = [
  {
    name: 'Composición corporal',
    metrics: [
      { key: 'weight', label: 'Peso', unit: 'kg', better: 'down', main: true },
      { key: 'smm', label: 'Masa musculoesquelética', unit: 'kg', better: 'up', main: true },
      { key: 'fat_mass', label: 'Masa grasa corporal', unit: 'kg', better: 'down', main: true },
      { key: 'pbf', label: 'Porcentaje de grasa', unit: '%', better: 'down', main: true },
      { key: 'tbw', label: 'Agua corporal total', unit: 'L', better: null },
      { key: 'protein', label: 'Proteínas', unit: 'kg', better: 'up' },
      { key: 'minerals', label: 'Minerales', unit: 'kg', better: null },
      { key: 'ffm', label: 'Masa libre de grasa', unit: 'kg', better: 'up' },
    ],
  },
  {
    name: 'Obesidad',
    metrics: [
      { key: 'bmi', label: 'IMC', unit: 'kg/m²', better: 'down' },
      { key: 'visceral', label: 'Grasa visceral', unit: 'nivel', better: 'down', main: true },
      { key: 'whr', label: 'Relación cintura-cadera', unit: '', better: 'down', main: true },
      { key: 'obesity_degree', label: 'Grado de obesidad', unit: '%', better: 'down' },
    ],
  },
  {
    name: 'Metabolismo y puntuación',
    metrics: [
      { key: 'score', label: 'Puntuación InBody', unit: 'pts', better: 'up', main: true },
      { key: 'bmr', label: 'Tasa metabólica basal', unit: 'kcal', better: 'up', main: true },
      { key: 'kcal_rec', label: 'Ingesta calórica recomendada', unit: 'kcal', better: null },
      { key: 'smi', label: 'IMME (índice de masa muscular)', unit: 'kg/m²', better: 'up' },
    ],
  },
  {
    name: 'Control de peso',
    metrics: [
      { key: 'target_weight', label: 'Peso objetivo', unit: 'kg', better: null },
      { key: 'fat_control', label: 'Control de grasa', unit: 'kg', better: null },
      { key: 'muscle_control', label: 'Control muscular', unit: 'kg', better: null },
    ],
  },
  {
    name: 'Magro por segmentos',
    metrics: [
      { key: 'lean_arm_l', label: 'Brazo izquierdo', unit: 'kg', better: 'up' },
      { key: 'lean_arm_l_pct', label: 'Brazo izquierdo', unit: '% ideal', better: 'up' },
      { key: 'lean_arm_r', label: 'Brazo derecho', unit: 'kg', better: 'up' },
      { key: 'lean_arm_r_pct', label: 'Brazo derecho', unit: '% ideal', better: 'up' },
      { key: 'lean_trunk', label: 'Tronco', unit: 'kg', better: 'up' },
      { key: 'lean_trunk_pct', label: 'Tronco', unit: '% ideal', better: 'up' },
      { key: 'lean_leg_l', label: 'Pierna izquierda', unit: 'kg', better: 'up' },
      { key: 'lean_leg_l_pct', label: 'Pierna izquierda', unit: '% ideal', better: 'up' },
      { key: 'lean_leg_r', label: 'Pierna derecha', unit: 'kg', better: 'up' },
      { key: 'lean_leg_r_pct', label: 'Pierna derecha', unit: '% ideal', better: 'up' },
    ],
  },
  {
    name: 'Grasa por segmentos',
    metrics: [
      { key: 'fat_arm_l', label: 'Brazo izquierdo', unit: 'kg', better: 'down' },
      { key: 'fat_arm_l_pct', label: 'Brazo izquierdo', unit: '% ideal', better: 'down' },
      { key: 'fat_arm_r', label: 'Brazo derecho', unit: 'kg', better: 'down' },
      { key: 'fat_arm_r_pct', label: 'Brazo derecho', unit: '% ideal', better: 'down' },
      { key: 'fat_trunk', label: 'Tronco', unit: 'kg', better: 'down' },
      { key: 'fat_trunk_pct', label: 'Tronco', unit: '% ideal', better: 'down' },
      { key: 'fat_leg_l', label: 'Pierna izquierda', unit: 'kg', better: 'down' },
      { key: 'fat_leg_l_pct', label: 'Pierna izquierda', unit: '% ideal', better: 'down' },
      { key: 'fat_leg_r', label: 'Pierna derecha', unit: 'kg', better: 'down' },
      { key: 'fat_leg_r_pct', label: 'Pierna derecha', unit: '% ideal', better: 'down' },
    ],
  },
];

export const INBODY_METRICS = INBODY_SECTIONS.flatMap((s) => s.metrics);
export const MAIN_METRICS = INBODY_METRICS.filter((m) => m.main);

/** Cambio entre dos mediciones y si es bueno, malo o neutro. */
export function metricChange(metric, cur, prev) {
  if (cur == null || prev == null) return null;
  const d = Math.round((Number(cur) - Number(prev)) * 100) / 100;
  let tone = 'neutral';
  if (d !== 0 && metric.better) tone = (d > 0) === (metric.better === 'up') ? 'good' : 'bad';
  return { delta: d, tone };
}
