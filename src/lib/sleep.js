/**
 * Fases del sueño como las da Apple Salud (en minutos). El tiempo dormido es
 * REM + ligero (principal) + profundo; los porcentajes son sobre el total,
 * despierto incluido, igual que en la gráfica de fases de Salud.
 */
export const STAGES = [
  { key: 'sleep_awake_min', code: 'awake', label: 'Despierto', hint: 'vigilia', color: '#f3a712' },
  { key: 'sleep_rem_min',   code: 'rem',   label: 'REM',       hint: 'sueños',  color: '#5ab8f0' },
  { key: 'sleep_core_min',  code: 'core',  label: 'Ligero',    hint: '«Principal» en Salud', color: '#4f7fe0' },
  { key: 'sleep_deep_min',  code: 'deep',  label: 'Profundo',  hint: 'reparador', color: '#7b5fd6' },
];

export function hasStages(log) {
  return STAGES.some((s) => log?.[s.key] != null);
}

export function stagesSummary(log) {
  const items = STAGES.map((s) => ({ ...s, min: Number(log?.[s.key] || 0) }));
  const totalMin = items.reduce((a, s) => a + s.min, 0);
  const asleepMin = totalMin - items[0].min;
  for (const s of items) s.pct = totalMin ? Math.round((s.min / totalMin) * 100) : 0;
  // Ajuste para que los porcentajes sumen exactamente 100
  const diff = 100 - items.reduce((a, s) => a + s.pct, 0);
  if (totalMin && diff) items.reduce((a, b) => (b.min > a.min ? b : a)).pct += diff;
  return { items, totalMin, asleepMin };
}

export function fmtMin(min) {
  const m = Math.round(Number(min) || 0);
  const h = Math.floor(m / 60);
  return h ? `${h} h ${String(m % 60).padStart(2, '0')} min` : `${m % 60} min`;
}

/** Campos a guardar a partir de lo que se escribió (h y min por fase). */
export function stageFields(values) {
  const out = {};
  for (const s of STAGES) {
    const v = values[s.code] || {};
    const empty = (v.h ?? '') === '' && (v.m ?? '') === '';
    out[s.key] = empty ? null : Math.round((Number(v.h) || 0) * 60 + (Number(v.m) || 0));
  }
  if (STAGES.slice(1).some((s) => out[s.key] != null)) {
    const asleep = STAGES.slice(1).reduce((a, s) => a + (out[s.key] || 0), 0);
    out.sleep_h = Math.round((asleep / 60) * 100) / 100;
  }
  return out;
}
