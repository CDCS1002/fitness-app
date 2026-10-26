import { useState } from 'preact/hooks';
import { saveRoutines, saveExercisePrefs, saveStrengthSettings, updateExercise } from '../lib/api.js';
import { DAY_NAMES } from '../lib/routine.js';
import { useProfile, patchProfile } from '../lib/profile.js';
import { similarExercises } from '../lib/exerciseMatch.js';
import { isEveryDay } from '../lib/routine.js';
import { NewExercise } from './StrengthSheets.jsx';

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const BODY = { superior: 'Tren superior', inferior: 'Tren inferior', core: 'Core' };

/** Mi rutina: semana, ejercicios de cada día, reglas de progresión y (admin) catálogo. */
export function RoutineEditor({ exercises, onClose, onExercisesChanged }) {
  const profile = useProfile();
  const [tab, setTab] = useState('semana');
  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true">
        <header class="sheet-head">
          <b>Mi rutina</b>
          <button class="link" onClick={onClose}>Cerrar</button>
        </header>
        <div class="sheet-tabs seg three">
          <button class={tab === 'semana' ? 'on' : ''} onClick={() => setTab('semana')}>Semana</button>
          <button class={tab === 'ejercicios' ? 'on' : ''} onClick={() => setTab('ejercicios')}>Ejercicios</button>
          <button class={tab === 'progresion' ? 'on' : ''} onClick={() => setTab('progresion')}>Progresión</button>
        </div>
        {tab === 'semana' && <Week rows={profile.routineRows} />}
        {tab === 'ejercicios' && <DayExercises exercises={exercises} rt={profile.routines} isAdmin={profile.isAdmin} onChanged={onExercisesChanged} />}
        {tab === 'progresion' && <Progression settings={profile.settings} />}
      </div>
    </div>
  );
}

/* ------------------------------- Semana ------------------------------- */
function Week({ rows }) {
  const byDay = Object.fromEntries(rows.map((r) => [r.weekday, r]));
  const [f, setF] = useState(() => [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    weekday: d,
    name: byDay[d]?.name || (d >= 6 ? 'Descanso' : ''),
    full_name: byDay[d]?.full_name || byDay[d]?.name || '',
    is_rest: byDay[d]?.is_rest ?? d >= 6,
  })));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (i, k, v) => { setSaved(false); setF(f.map((r, j) => (j === i ? { ...r, [k]: v } : r))); };
  const ok = f.every((r) => r.is_rest || r.name.trim());

  async function save() {
    setBusy(true);
    try {
      const out = await saveRoutines(f.map((r) => ({
        ...r,
        name: r.is_rest ? 'Descanso' : r.name.trim(),
        full_name: r.is_rest ? 'Descanso' : (r.full_name.trim() || r.name.trim()),
      })));
      patchProfile({ routineRows: out });
      setSaved(true);
    } catch (err) { alert(err.message); }
    setBusy(false);
  }

  return (
    <div class="sheet-body form">
      <p class="muted hint">Qué rutina haces cada día. El nombre corto se usa en los botones; el completo, en el encabezado del día.</p>
      {f.map((r, i) => (
        <div class={`week-row ${r.is_rest ? 'rest' : ''}`} key={r.weekday}>
          <div class="week-row-head">
            <b>{DAY_NAMES[r.weekday]}</b>
            <label class="check"><input type="checkbox" checked={r.is_rest} onChange={(e) => set(i, 'is_rest', e.currentTarget.checked)} /> Descanso</label>
          </div>
          {!r.is_rest && (
            <div class="grid2">
              <label>Nombre corto<input value={r.name} placeholder="Pierna" onInput={(e) => set(i, 'name', e.currentTarget.value)} /></label>
              <label>Nombre completo<input value={r.full_name} placeholder="Pierna + abdomen" onInput={(e) => set(i, 'full_name', e.currentTarget.value)} /></label>
            </div>
          )}
        </div>
      ))}
      <button class="btn primary wide" disabled={busy || !ok} onClick={save}>{busy ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar semana'}</button>
    </div>
  );
}

/* -------------------------- Ejercicios por día -------------------------- */
function DayExercises({ exercises, rt, isAdmin, onChanged }) {
  const [day, setDay] = useState(rt.trainingDays[0] || 1);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [local, setLocal] = useState({}); // id → días (cambios aún no recargados)

  const daysOf = (e) => local[e.id] ?? e.days ?? [];
  const inDay = (e) => daysOf(e).includes(day);
  const list = exercises
    .filter((e) => !e.archived && norm(`${e.name} ${e.muscle || ''}`).includes(norm(q.trim())))
    .sort((a, b) => (inDay(b) - inDay(a))
      || (isEveryDay({ days: daysOf(a) }, rt) - isEveryDay({ days: daysOf(b) }, rt))
      || (a.muscle || '').localeCompare(b.muscle || '') || a.name.localeCompare(b.name));
  const count = exercises.filter((e) => !e.archived && inDay(e)).length;

  async function toggle(e) {
    const cur = daysOf(e);
    const days = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day].sort((a, b) => a - b);
    setBusyId(e.id);
    try {
      await saveExercisePrefs(e.id, { days, archived: false });
      setLocal({ ...local, [e.id]: days });
    } catch (err) { alert(err.message); }
    setBusyId(null);
  }

  if (creating) {
    return (
      <NewExercise initialName={q} initialDays={[day]} exercises={exercises} title="Agregar al catálogo" submitLabel="Agregar ejercicio"
        onBack={() => setCreating(false)}
        onPickExisting={(ex) => { setCreating(false); setQ(ex.name); }}
        onCreated={() => { setCreating(false); onChanged(); }} />
    );
  }
  if (editing) {
    return <EditExercise ex={editing} exercises={exercises} onBack={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />;
  }

  return (
    <div class="sheet-body">
      {!rt.trainingDays.length && <p class="muted hint">Primero define tus días de entreno en «Semana».</p>}
      <div class="chips routine-chips">
        {rt.trainingDays.map((d) => (
          <button key={d} class={day === d ? 'on' : ''} onClick={() => setDay(d)}>{DAY_NAMES[d].slice(0, 3)} · {rt.short(d)}</button>
        ))}
      </div>
      <p class="muted hint">{count} {count === 1 ? 'ejercicio' : 'ejercicios'} en {rt.short(day).toLowerCase()}. Toca uno para agregarlo o quitarlo de este día. Si está en todos tus días de entreno (como el abdomen) se muestra al final.</p>
      <input class="search" type="search" placeholder="Buscar en el catálogo…" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
      <ul class="ex-pick">
        {list.map((e) => (
          <li key={e.id}>
            <button class={`ex-toggle ${inDay(e) ? 'on' : ''}`} disabled={busyId === e.id} onClick={() => toggle(e)} aria-pressed={inDay(e)}>
              <span class="ex-check" aria-hidden="true">{inDay(e) ? '✓' : ''}</span>
              <span class="entry-main">
                <span class="entry-name">{e.name}</span>
                <span class="muted">{[e.muscle, daysOf(e).filter((d) => rt.isTraining(d)).map((d) => DAY_NAMES[d].slice(0, 3)).join(' · ')].filter(Boolean).join(' · ')}</span>
              </span>
            </button>
            {isAdmin && <button class="info-btn" aria-label={`Editar ${e.name}`} onClick={() => setEditing(e)}>✎</button>}
          </li>
        ))}
      </ul>
      <button class="btn ghost wide" onClick={() => setCreating(true)}>+ Agregar ejercicio al catálogo</button>
    </div>
  );
}

/* --------------------- Editar datos generales (admin) --------------------- */
function EditExercise({ ex, exercises, onBack, onSaved }) {
  const [f, setF] = useState({ name: ex.name, muscle: ex.muscle || '', body: ex.body, measure: ex.measure });
  const [busy, setBusy] = useState(false);
  const others = exercises.filter((e) => e.id !== ex.id);
  const clash = f.name.trim() !== ex.name ? similarExercises(f.name, others).find((s) => s.exact) : null;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateExercise(ex.id, { name: f.name.trim(), muscle: f.muscle.trim() || null, body: f.body, measure: f.measure });
      onSaved();
    } catch (err) {
      alert(err.message.includes('duplicate') ? 'Ya existe otro ejercicio con ese nombre.' : err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <header class="sheet-head">
        <button class="link" onClick={onBack}>‹ Ejercicios</button>
        <b>Editar ejercicio</b>
      </header>
      <form class="sheet-body form" onSubmit={save}>
        <p class="muted hint">El cambio aplica para todos los usuarios. Los registros anteriores se conservan.</p>
        <label>Nombre<input required value={f.name} onInput={(e) => setF({ ...f, name: e.currentTarget.value })} /></label>
        {clash && <p class="error">Ya existe «{clash.ex.name}» en el catálogo.</p>}
        <label>Grupo muscular<input value={f.muscle} onInput={(e) => setF({ ...f, muscle: e.currentTarget.value })} /></label>
        <div class="grid2">
          <label>Tren
            <select value={f.body} onChange={(e) => setF({ ...f, body: e.currentTarget.value })}>
              {Object.entries(BODY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Medida
            <select value={f.measure} onChange={(e) => setF({ ...f, measure: e.currentTarget.value })}>
              <option value="reps">Repeticiones</option>
              <option value="segundos">Segundos (isométrico)</option>
            </select>
          </label>
        </div>
        <button class="btn primary wide" disabled={busy || !f.name.trim() || !!clash}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
      </form>
    </>
  );
}

/* ---------------------------- Progresión ---------------------------- */
function Progression({ settings }) {
  const s = settings || {};
  const [f, setF] = useState({
    reps_min: s.reps_min ?? 6, reps_max: s.reps_max ?? 10, secs_min: s.secs_min ?? 30, secs_max: s.secs_max ?? 90,
    step_inferior: s.step_inferior ?? 5, step_superior: s.step_superior ?? 2.5, step_core: s.step_core ?? 2.5, step_isometrico: s.step_isometrico ?? 2.5,
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const num = (k) => (e) => { setSaved(false); setF({ ...f, [k]: e.currentTarget.value }); };
  const n = (k) => Number(f[k]);
  const ok = n('reps_min') > 0 && n('reps_max') >= n('reps_min') && n('secs_min') > 0 && n('secs_max') >= n('secs_min')
    && ['step_inferior', 'step_superior', 'step_core', 'step_isometrico'].every((k) => n(k) > 0);

  async function save() {
    setBusy(true);
    try {
      const row = await saveStrengthSettings(Object.fromEntries(Object.keys(f).map((k) => [k, Number(f[k])])));
      patchProfile({ settings: row });
      setSaved(true);
    } catch (err) { alert(err.message); }
    setBusy(false);
  }

  // Función (no componente) para que los inputs no se vuelvan a montar al escribir
  const field = (k, label, step = 1) => (
    <label key={k}>{label}<input type="number" inputmode="decimal" step={step} min="0" value={f[k]} onInput={num(k)} /></label>
  );

  return (
    <div class="sheet-body form">
      <p class="muted hint">Si todas las series llegan al máximo del rango, la app sugiere subir el peso; si alguna queda por debajo del mínimo, bajarlo; si no, mantenerlo.</p>
      <fieldset>
        <legend>Rango de repeticiones</legend>
        <div class="grid2">{field('reps_min', 'Mínimo')}{field('reps_max', 'Máximo')}</div>
      </fieldset>
      <fieldset>
        <legend>Isométricos (segundos)</legend>
        <div class="grid2">{field('secs_min', 'Mínimo')}{field('secs_max', 'Máximo')}</div>
      </fieldset>
      <fieldset>
        <legend>Cuánto subir o bajar (kg)</legend>
        <div class="grid2">
          {field('step_inferior', 'Tren inferior', 0.5)}
          {field('step_superior', 'Tren superior', 0.5)}
          {field('step_core', 'Core', 0.5)}
          {field('step_isometrico', 'Isométricos', 0.5)}
        </div>
      </fieldset>
      <button class="btn primary wide" disabled={busy || !ok} onClick={save}>{busy ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar reglas'}</button>
    </div>
  );
}
