// Fechas locales en formato YYYY-MM-DD (sin desfases por UTC)
export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const today = () => toISO(new Date());

export function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function labelFor(iso) {
  if (iso === today()) return 'Hoy';
  if (iso === addDays(today(), -1)) return 'Ayer';
  if (iso === addDays(today(), 1)) return 'Mañana';
  return fromISO(iso).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' });
}

export function longLabel(iso) {
  return fromISO(iso).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}
