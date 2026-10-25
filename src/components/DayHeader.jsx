import { addDays, labelFor, today } from '../lib/dates.js';

/** Encabezado con la fecha; la fecha es compartida entre pestañas. */
export function DayHeader({ date, setDate, title, children }) {
  return (
    <header class="topbar">
      <button class="icon-btn" aria-label="Día anterior" onClick={() => setDate(addDays(date, -1))}>‹</button>
      <button class="day-title" onClick={() => setDate(today())}>
        {title && <small class="muted tab-title">{title}</small>}
        <span>{labelFor(date)}</span>
        {date !== today() && <small class="muted">volver a hoy</small>}
      </button>
      <button class="icon-btn" aria-label="Día siguiente" onClick={() => setDate(addDays(date, 1))}>›</button>
      {children && <div class="topbar-extra">{children}</div>}
    </header>
  );
}
