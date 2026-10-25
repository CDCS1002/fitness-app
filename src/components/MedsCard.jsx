import { useEffect, useState } from 'preact/hooks';
import { listMeds, saveMed, medLogsFor, logMed, deleteMedLog, lookupMedBarcode } from '../lib/api.js';
import { KINDS, FORMS, kindOf, medsForDay, doseLabel, ingredientsLabel } from '../lib/meds.js';
import { DAY_NAMES } from '../lib/routine.js';
import { today } from '../lib/dates.js';
import { Scanner } from './Scanner.jsx';
import { EXTRA_SECTIONS } from '../lib/meals.js';

const SECTION = EXTRA_SECTIONS.find((s) => s.code === 'meds');

const nowHM = () => new Date().toTimeString().slice(0, 5);
const hm = (t) => (t ? String(t).slice(0, 5) : '');

/** Tarjeta del día en Alimentación: tomas programadas, marcar y agregar. */
export function MedsCard({ date }) {
  const [meds, setMeds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState(null); // 'add' | { edit: med }

  useEffect(() => {
    let alive = true;
    setError('');
    Promise.all([listMeds(), medLogsFor(date)])
      .then(([m, l]) => { if (alive) { setMeds(m); setLogs(l); } })
      .catch((err) => alive && setError(err.message.includes('meds') ? 'Ejecuta la migración 0012 para activar esta sección.' : err.message));
    return () => { alive = false; };
  }, [date]);

  const rows = medsForDay(meds, logs, date);
  const plannedTotal = rows.reduce((a, r) => a + r.planned, 0);
  const takenTotal = rows.reduce((a, r) => a + Math.min(r.taken.length, r.planned || r.taken.length), 0);
  const summary = !rows.length ? 'Nada programado para este día'
    : plannedTotal ? `${takenTotal} de ${plannedTotal} ${plannedTotal === 1 ? 'toma' : 'tomas'}` : `${takenTotal} ${takenTotal === 1 ? 'toma' : 'tomas'}`;

  async function take(med) {
    try {
      const row = await logMed({ day: date, med_id: med.id, taken_at: date === today() ? nowHM() : null, amount: med.dose_amount, unit: med.dose_unit });
      setLogs((l) => [...l, row]);
    } catch (err) { alert(err.message); }
  }

  async function untake(log, med) {
    if (!confirm(`¿Quitar la toma de ${med.name}${log.taken_at ? ` de las ${hm(log.taken_at)}` : ''}?`)) return;
    try { await deleteMedLog(log.id); setLogs((l) => l.filter((x) => x.id !== log.id)); } catch (err) { alert(err.message); }
  }

  function upsertMed(m) {
    setMeds((l) => [...l.filter((x) => x.id !== m.id), m].sort((a, b) => a.name.localeCompare(b.name)));
  }

  return (
    <section class={`meal meal-card meds ${rows.length ? '' : 'empty-meal'}`} style={`--c:${SECTION.color}`}>
      <header>
        <span class="meal-ic" aria-hidden="true">{SECTION.icon}</span>
        <h2>{SECTION.name}</h2>
        <span class="muted">{error ? '' : summary}</span>
        <button class="add-btn" aria-label="Agregar medicamento o suplemento" onClick={() => setSheet('add')}>+</button>
      </header>
      {error && <p class="muted hint">{error}</p>}
      {rows.map(({ med, planned, taken }) => {
        const k = kindOf(med.kind);
        const done = planned > 0 && taken.length >= planned;
        return (
          <div class={`med-row ${done ? 'done' : ''}`} key={med.id}>
            <button class="med-main" onClick={() => setSheet({ edit: med })}>
              <span class="act-icon" aria-hidden="true">{k.icon}</span>
              <span class="entry-main">
                <span class="entry-name">{med.name}</span>
                <span class="muted">
                  {[doseLabel(med), med.times?.length ? med.times.map(hm).join(', ') : null, planned === 0 ? 'fuera de horario' : null].filter(Boolean).join(' · ')}
                </span>
              </span>
            </button>
            <div class="med-takes">
              {taken.map((t) => (
                <button key={t.id} class="take on" onClick={() => untake(t, med)} aria-label={`Quitar toma de ${med.name}`}>✓{t.taken_at ? ` ${hm(t.taken_at)}` : ''}</button>
              ))}
              {(!done || planned === 0) && (
                <button class="take" onClick={() => take(med)} aria-label={`Marcar ${med.name} como tomado`}>
                  {planned > 1 ? `${taken.length + 1}/${planned}` : 'Tomar'}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {sheet === 'add' && (
        <AddMed
          meds={meds}
          onClose={() => setSheet(null)}
          onPickExisting={(m) => { setSheet(null); take(m); }}
          onCreated={(m, takeNow) => { upsertMed(m); setSheet(null); if (takeNow) take(m); }}
        />
      )}
      {sheet?.edit && (
        <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <div class="sheet" role="dialog" aria-modal="true">
            <MedForm initial={sheet.edit} onBack={() => setSheet(null)} onSaved={(m) => { upsertMed(m); setSheet(null); }} />
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------------- Agregar: catálogo, escáner o nuevo ---------------------- */
function AddMed({ meds, onClose, onPickExisting, onCreated }) {
  const [step, setStep] = useState('list');
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState(null);
  const [notice, setNotice] = useState(null);
  const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = meds.filter((m) => norm(`${m.name} ${m.brand}`).includes(norm(q.trim())));

  async function onCode(code) {
    setStep('lookup');
    try {
      const r = await lookupMedBarcode(code);
      if (r.med) { onPickExisting(r.med); return; }
      if (r.draft) {
        setDraft(r.draft);
        setNotice(r.draft.source === 'dsld'
          ? { kind: 'ok', text: 'Encontrado en la base de suplementos del NIH (EE. UU.). Revisa la dosis contra tu etiqueta; los nombres de ingredientes vienen en inglés.' }
          : { kind: 'warn', text: 'Encontrado en Open Food Facts, sin dosis por ingrediente. Complétalo con la etiqueta.' });
      } else {
        setDraft({ barcode: String(code) });
        setNotice({ kind: 'warn', text: `El código ${code} no está en las bases públicas (es normal en medicamentos de Costa Rica). Agrégalo con los datos de la caja.` });
      }
      setStep('new');
    } catch (err) { alert(err.message); setStep('list'); }
  }

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true">
        {step === 'list' && (
          <>
            <header class="sheet-head">
              <input class="search" type="search" placeholder="Buscar en tus medicamentos…" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
              <button class="icon-btn scan-btn" aria-label="Escanear código de barras" onClick={() => setStep('scan')}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 9v6M11 9v6M14 9v6M17 9v6" />
                </svg>
              </button>
              <button class="link" onClick={onClose}>Cerrar</button>
            </header>
            <div class="sheet-body">
              {list.length > 0 && <p class="section-label">Registrar una toma</p>}
              {list.map((m) => (
                <button class="result" key={m.id} onClick={() => onPickExisting(m)}>
                  <span class="act-icon" aria-hidden="true">{kindOf(m.kind).icon}</span>
                  <span class="entry-main">
                    <span class="entry-name">{m.name}</span>
                    <span class="muted">{[m.brand, doseLabel(m), m.active ? null : 'inactivo'].filter(Boolean).join(' · ')}</span>
                  </span>
                </button>
              ))}
              <button class="btn ghost wide" onClick={() => { setDraft({ name: q }); setNotice(null); setStep('new'); }}>+ Crear medicamento o suplemento</button>
            </div>
          </>
        )}
        {step === 'scan' && <Scanner onCode={onCode} onCancel={() => setStep('list')} />}
        {step === 'lookup' && <div class="sheet-body lookup"><div class="spinner" aria-hidden="true" /><p>Buscando…</p></div>}
        {step === 'new' && (
          <MedForm initial={draft} notice={notice} onBack={() => setStep('list')} onSaved={(m, takeNow) => onCreated(m, takeNow)} isNew />
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Formulario ------------------------------ */
function MedForm({ initial = {}, notice, onBack, onSaved, isNew }) {
  const [f, setF] = useState({
    name: '', brand: '', kind: 'suplemento', form: '', dose_amount: '', dose_unit: '', barcode: '', notes: '',
    days: [1, 2, 3, 4, 5, 6, 7], times: [], active: true, source: 'manual',
    ...Object.fromEntries(Object.entries(initial || {}).filter(([, v]) => v != null)),
    ingredients: (initial?.ingredients || []).map((i) => ({ ...i, amount: i.amount ?? '' })),
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value });
  const toggleDay = (d) => setF({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort() });
  const setIng = (i, k) => (e) => setF({ ...f, ingredients: f.ingredients.map((x, j) => (j === i ? { ...x, [k]: e.currentTarget.value } : x)) });
  const setTime = (i) => (e) => setF({ ...f, times: f.times.map((t, j) => (j === i ? e.currentTarget.value : t)) });

  async function save(takeNow) {
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      const row = {
        id: f.id,
        name: f.name.trim(),
        brand: String(f.brand || '').trim() || null,
        kind: f.kind,
        form: f.form || null,
        dose_amount: f.dose_amount === '' ? null : Number(f.dose_amount),
        dose_unit: String(f.dose_unit || '').trim() || null,
        ingredients: f.ingredients.filter((i) => String(i.name || '').trim())
          .map((i) => ({ name: i.name.trim(), amount: i.amount === '' ? null : Number(i.amount), unit: String(i.unit || '').trim() || null })),
        barcode: String(f.barcode || '').trim() || null,
        times: f.times.filter(Boolean).sort(),
        days: f.days,
        active: f.active,
        notes: String(f.notes || '').trim() || null,
        source: f.source || 'manual',
      };
      if (!row.id) delete row.id;
      onSaved(await saveMed(row), takeNow);
    } catch (err) {
      alert(err.message.includes('meds_user_barcode') ? 'Ya tienes un medicamento con ese código de barras.' : err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <header class="sheet-head">
        <button class="link" onClick={onBack}>{isNew ? '‹ Volver' : 'Cerrar'}</button>
        <b>{isNew ? 'Nuevo' : 'Editar'}</b>
      </header>
      <form class="sheet-body form" onSubmit={(e) => { e.preventDefault(); save(false); }}>
        {notice && <div class={`notice ${notice.kind}`}><span>{notice.text}</span></div>}
        <div class="chips">
          {KINDS.map((k) => (
            <button type="button" key={k.code} class={f.kind === k.code ? 'on' : ''} onClick={() => setF({ ...f, kind: k.code })}>{k.icon} {k.name}</button>
          ))}
        </div>
        <label>Nombre<input required value={f.name} onInput={set('name')} placeholder="Creatina monohidratada, Magnesio…" /></label>
        <div class="grid2">
          <label>Marca<input value={f.brand} onInput={set('brand')} /></label>
          <label>Forma
            <select value={f.form || ''} onChange={set('form')}>
              <option value="">—</option>
              {FORMS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
        </div>
        <div class="grid2">
          <label>Cantidad por toma<input type="number" inputmode="decimal" step="any" value={f.dose_amount} onInput={set('dose_amount')} placeholder="5, 2, 1…" /></label>
          <label>Unidad<input value={f.dose_unit} onInput={set('dose_unit')} placeholder="g, cápsula, tableta, ml" /></label>
        </div>

        <fieldset>
          <legend>Contenido por toma (opcional)</legend>
          {f.ingredients.map((ing, i) => (
            <div class="ing-row" key={i}>
              <input aria-label="Ingrediente" placeholder="Magnesio (glicinato)" value={ing.name} onInput={setIng(i, 'name')} />
              <input aria-label="Cantidad" type="number" inputmode="decimal" step="any" value={ing.amount} onInput={setIng(i, 'amount')} />
              <input aria-label="Unidad" placeholder="mg" value={ing.unit || ''} onInput={setIng(i, 'unit')} />
              <button type="button" class="link danger" aria-label="Quitar ingrediente" onClick={() => setF({ ...f, ingredients: f.ingredients.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button type="button" class="link" onClick={() => setF({ ...f, ingredients: [...f.ingredients, { name: '', amount: '', unit: 'mg' }] })}>+ Ingrediente</button>
        </fieldset>

        <fieldset>
          <legend>Horario</legend>
          <div class="chips">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button type="button" key={d} class={f.days.includes(d) ? 'on' : ''} onClick={() => toggleDay(d)}>{DAY_NAMES[d].slice(0, 3)}</button>
            ))}
          </div>
          <div class="times">
            {f.times.map((t, i) => (
              <span key={i} class="time-chip">
                <input type="time" value={t} onInput={setTime(i)} aria-label={`Hora ${i + 1}`} />
                <button type="button" class="link danger" aria-label="Quitar hora" onClick={() => setF({ ...f, times: f.times.filter((_, j) => j !== i) })}>✕</button>
              </span>
            ))}
            <button type="button" class="link" onClick={() => setF({ ...f, times: [...f.times, '08:00'] })}>+ Hora</button>
          </div>
          <p class="muted hint">Una toma por cada hora. Sin horas, cuenta como una toma al día.</p>
        </fieldset>

        <label>Código de barras<input inputmode="numeric" value={f.barcode || ''} onInput={set('barcode')} /></label>
        <label>Notas<input value={f.notes || ''} onInput={set('notes')} placeholder="Con comida, indicado por…" /></label>
        {!isNew && (
          <label class="check"><input type="checkbox" checked={f.active} onChange={set('active')} /> Activo (aparece cada día programado)</label>
        )}
        {f.ingredients.some((i) => i.name) && <p class="muted hint">{ingredientsLabel(f.ingredients)}</p>}
        <button class="btn primary wide" disabled={busy || !f.name.trim()}>{busy ? 'Guardando…' : 'Guardar'}</button>
        {isNew && <button type="button" class="btn ghost wide" disabled={busy || !f.name.trim()} onClick={() => save(true)}>Guardar y marcar como tomado</button>}
      </form>
    </>
  );
}
