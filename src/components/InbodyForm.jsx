import { useState } from 'preact/hooks';
import { saveInbody, deleteInbody } from '../lib/api.js';
import { INBODY_SECTIONS, MAIN_METRICS } from '../lib/inbody.js';
import { today } from '../lib/dates.js';

/** Alta o edición de una medición InBody. Los indicadores principales primero; el resto, opcional. */
export function InbodyForm({ scan, previous, onClose, onSaved }) {
  const init = Object.fromEntries(Object.entries(scan?.metrics || {}).map(([k, v]) => [k, String(v)]));
  const [day, setDay] = useState(scan?.day || today());
  const [vals, setVals] = useState(init);
  const [notes, setNotes] = useState(scan?.notes || '');
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);

  const input = (m) => (
    <label key={m.key}>{m.label}{m.unit && ` (${m.unit})`}
      <input type="number" inputmode="decimal" step="any"
        placeholder={previous?.metrics?.[m.key] != null && !scan ? String(previous.metrics[m.key]) : ''}
        value={vals[m.key] ?? ''} onInput={(e) => setVals({ ...vals, [m.key]: e.currentTarget.value })} />
    </label>
  );

  const metrics = Object.fromEntries(
    Object.entries(vals).filter(([, v]) => v !== '' && v != null && !Number.isNaN(Number(v))).map(([k, v]) => [k, Number(v)]),
  );

  async function save(e) {
    e.preventDefault();
    if (!Object.keys(metrics).length) return;
    setBusy(true);
    try {
      await saveInbody({ id: scan?.id, day, metrics, notes: notes.trim() });
      onSaved();
    } catch (err) {
      alert(err.message.includes('duplicate') ? 'Ya hay una medición en esa fecha; edítala en vez de crear otra.' : err.message);
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('¿Eliminar esta medición InBody?')) return;
    try { await deleteInbody(scan.id); onSaved(); } catch (err) { alert(err.message); }
  }

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true">
        <header class="sheet-head">
          <b>{scan ? 'Editar medición' : 'Nueva medición InBody'}</b>
          <button class="link" onClick={onClose}>Cerrar</button>
        </header>
        <form class="sheet-body form" onSubmit={save}>
          <label>Fecha<input type="date" required max={today()} value={day} onInput={(e) => setDay(e.currentTarget.value)} /></label>
          <p class="muted hint">Copia los valores de tu hoja de resultados. Solo los principales son necesarios; los que dejes vacíos no se guardan.</p>
          <div class="grid2">{MAIN_METRICS.map(input)}</div>
          <button type="button" class="link" onClick={() => setMore(!more)}>
            {more ? '− Ocultar indicadores adicionales' : '+ Indicadores adicionales (segmentos, agua, IMC…)'}
          </button>
          {more && INBODY_SECTIONS.map((s) => {
            const rest = s.metrics.filter((m) => !m.main);
            if (!rest.length) return null;
            return (
              <fieldset key={s.name}>
                <legend>{s.name}</legend>
                <div class="grid2">{rest.map(input)}</div>
              </fieldset>
            );
          })}
          <label>Notas<input value={notes} onInput={(e) => setNotes(e.currentTarget.value)} placeholder="Opcional" /></label>
          <button class="btn primary wide" disabled={busy || !Object.keys(metrics).length}>{busy ? 'Guardando…' : 'Guardar medición'}</button>
          {scan && <button type="button" class="link danger center" onClick={remove}>Eliminar medición</button>}
        </form>
      </div>
    </div>
  );
}
