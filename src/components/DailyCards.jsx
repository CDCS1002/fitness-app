import { useEffect, useRef, useState } from 'preact/hooks';
import { addWater, setSteps, addActivity, deleteActivity } from '../lib/api.js';
import { STAGES, hasStages, stagesSummary, stageFields, fmtMin } from '../lib/sleep.js';
import { dayEnergy } from '../lib/energy.js';
import { ACTIVITY_KINDS, kindOf, GLASS_ML, isTrainingDay, waterTarget } from '../lib/activity.js';

const n0 = (x) => Math.round(Number(x) || 0);
const int = (x) => new Intl.NumberFormat('es', { useGrouping: 'always' }).format(Math.round(Number(x) || 0));
const liters = (ml) => (Math.round((Number(ml) || 0) / 50) / 20).toLocaleString('es', { maximumFractionDigits: 2 });

/* ---------------------------- Actividad ---------------------------- */
export function ActivityCard({ date, activities, setActivities }) {
  const [adding, setAdding] = useState(false);
  const total = activities.reduce((a, x) => a + Number(x.active_kcal || 0), 0);

  async function remove(a) {
    if (!confirm(`¿Eliminar ${a.title || kindOf(a.kind).name}?`)) return;
    try {
      await deleteActivity(a.id);
      setActivities((l) => l.filter((x) => x.id !== a.id));
    } catch (err) { alert(err.message); }
  }

  return (
    <section class="card">
      <header class="card-head">
        <h2>Actividad</h2>
        <span class="card-big">🔥 {n0(total)} <small class="muted">kcal activas</small></span>
      </header>
      {activities.map((a) => {
        const k = kindOf(a.kind);
        return (
          <button class="entry" key={a.id} onClick={() => remove(a)} title="Tocar para eliminar">
            <span class="act-icon" aria-hidden="true">{k.icon}</span>
            <span class="entry-main">
              <span class="entry-name">{a.title || k.name}</span>
              <span class="muted">{k.name}{a.duration_min ? ` · ${n0(a.duration_min)} min` : ''}</span>
            </span>
            <span class="entry-side"><span>{n0(a.active_kcal)} kcal</span></span>
          </button>
        );
      })}
      <button class="wide-btn" aria-label="Agregar actividad" onClick={() => setAdding(true)}>+</button>
      {adding && (
        <AddActivity
          date={date}
          onClose={() => setAdding(false)}
          onAdded={(a) => { setActivities((l) => [...l, a]); setAdding(false); }}
        />
      )}
    </section>
  );
}

function AddActivity({ date, onClose, onAdded }) {
  const [kind, setKind] = useState('fuerza');
  const [title, setTitle] = useState(ACTIVITY_KINDS[0].titles[0]);
  const [duration, setDuration] = useState('');
  const [kcal, setKcal] = useState('');
  const [busy, setBusy] = useState(false);
  const k = kindOf(kind);

  function pickKind(code) {
    setKind(code);
    setTitle(kindOf(code).titles[0] || '');
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      onAdded(await addActivity({
        day: date, kind, title: title.trim() || null,
        duration_min: duration === '' ? null : Number(duration),
        active_kcal: kcal === '' ? null : Number(kcal),
      }));
    } catch (err) { alert(err.message); setBusy(false); }
  }

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet short" role="dialog" aria-modal="true">
        <header class="sheet-head">
          <b>Agregar actividad</b>
          <button class="link" onClick={onClose}>Cerrar</button>
        </header>
        <form class="sheet-body form" onSubmit={save}>
          <div class="chips">
            {ACTIVITY_KINDS.map((x) => (
              <button type="button" key={x.code} class={kind === x.code ? 'on' : ''} onClick={() => pickKind(x.code)}>
                {x.icon} {x.name}
              </button>
            ))}
          </div>
          {k.titles.length > 1 && (
            <div class="chips small">
              {k.titles.map((t) => (
                <button type="button" key={t} class={title === t ? 'on' : ''} onClick={() => setTitle(t)}>{t}</button>
              ))}
            </div>
          )}
          <label>Nombre<input value={title} onInput={(e) => setTitle(e.currentTarget.value)} placeholder="Ej. Pierna" /></label>
          <div class="grid2">
            <label>Duración (min)
              <input type="number" inputmode="numeric" step="any" value={duration} onInput={(e) => setDuration(e.currentTarget.value)} />
            </label>
            <label>Kcal activas
              <input type="number" inputmode="numeric" step="any" required value={kcal} onInput={(e) => setKcal(e.currentTarget.value)} />
            </label>
          </div>
          <p class="muted hint">Usa las kcal activas que marca el Apple Watch al terminar la sesión.</p>
          <button class="btn primary wide" disabled={busy}>{busy ? 'Guardando…' : 'Agregar'}</button>
        </form>
      </div>
    </div>
  );
}

/* --------------------------- Gasto del día --------------------------- */
export function TotalKcalCard({ total, activities, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const input = useRef(null);
  const workouts = activities.reduce((a, x) => a + Number(x.active_kcal || 0), 0);
  const e = dayEnergy({ total, workouts });

  useEffect(() => { if (editing) input.current?.focus(); }, [editing]);

  function start() {
    setValue(total != null ? String(n0(total)) : '');
    setEditing(true);
  }

  async function save(ev) {
    ev.preventDefault();
    try {
      await onSave({ total_kcal: value === '' ? null : Math.max(0, Math.round(Number(value))) });
      setEditing(false);
    } catch (err) {
      alert(err.message.includes('total_kcal') ? 'Ejecuta la migración 0014 para guardar el gasto total.' : err.message);
    }
  }

  const pct = e.total ? Math.min(e.workouts / e.total, 1) : 0;
  return (
    <section class="card">
      <header class="card-head"><h2>Gasto del día</h2><span class="muted">kcal totales del reloj</span></header>
      {editing ? (
        <form class="steps-edit" onSubmit={save}>
          <input ref={input} type="number" inputmode="numeric" min="0" value={value}
            onInput={(ev) => setValue(ev.currentTarget.value)} placeholder="Kcal totales del día" />
          <button class="btn primary">Guardar</button>
          <button type="button" class="link" onClick={() => setEditing(false)}>Cancelar</button>
        </form>
      ) : (
        <button class="metric-row as-btn" onClick={start} aria-label="Editar gasto total">
          <span class="metric">⚡ <b>{e.total != null ? int(e.total) : '—'}</b><span class="muted"> kcal totales</span></span>
          <span class="muted">✎</span>
        </button>
      )}
      {e.total != null && (
        <>
          <div class="bar split" aria-hidden="true">
            <span style={`width:${pct * 100}%;background:var(--warn)`} />
            <span style={`width:${(1 - pct) * 100}%;background:var(--accent)`} />
          </div>
          <div class="split-legend">
            <span><i style="background:var(--warn)" />Entrenamiento <b>{int(e.workouts)}</b></span>
            <span><i style="background:var(--accent)" />Fuera del entreno <b>{int(e.outside)}</b></span>
          </div>
          {e.inconsistent && <p class="error">Las kcal de tus actividades superan el total. Revisa el dato del reloj.</p>}
        </>
      )}
      {e.total == null && <p class="muted hint">Regístralo al final del día con el total que marca el reloj; la app resta las kcal de tus entrenamientos.</p>}
    </section>
  );
}

/* ------------------------------- Agua ------------------------------- */
export function WaterCard({ date, plan, waterMl, setWaterMl }) {
  const target = waterTarget(date, plan);
  const pending = useRef(0);
  const [error, setError] = useState('');

  async function change(delta) {
    if (delta < 0 && waterMl <= 0) return;
    setError('');
    setWaterMl((w) => Math.max(0, w + delta));
    pending.current += 1;
    try {
      const server = await addWater(date, delta);
      pending.current -= 1;
      if (pending.current === 0) setWaterMl(server);
    } catch (err) {
      pending.current -= 1;
      setWaterMl((w) => Math.max(0, w - delta));
      setError('No se pudo guardar el agua.');
    }
  }

  const pct = Math.min(waterMl / target, 1);
  return (
    <section class="card">
      <header class="card-head">
        <h2>Agua</h2>
        <span class="muted">{isTrainingDay(date, plan) ? 'Día de entreno' : 'Día de descanso'}</span>
      </header>
      <div class="metric-row">
        <span class="metric">🥛 <b>{liters(waterMl)}</b><span class="muted"> / {liters(target)} L</span></span>
        <span class="muted">{n0(waterMl / GLASS_ML)} de {Math.ceil(target / GLASS_ML)} vasos</span>
      </div>
      <div class="bar"><span style={`width:${pct * 100}%;background:var(--water)`} /></div>
      <div class="pair">
        <button class="wide-btn" aria-label="Quitar un vaso" onClick={() => change(-GLASS_ML)}>−</button>
        <button class="wide-btn" aria-label="Agregar un vaso" onClick={() => change(GLASS_ML)}>+</button>
      </div>
      {error && <p class="error">{error}</p>}
    </section>
  );
}

/* ------------------------------- Pasos ------------------------------ */
export function StepsCard({ date, plan, steps, setStepsValue }) {
  const target = Number(plan?.steps_target || 10000);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const input = useRef(null);

  useEffect(() => { if (editing) input.current?.focus(); }, [editing]);

  function start() {
    setValue(steps ? String(steps) : '');
    setEditing(true);
  }

  async function save(e) {
    e.preventDefault();
    const n = value === '' ? null : Math.max(0, Math.round(Number(value)));
    try {
      await setSteps(date, n);
      setStepsValue(n);
      setEditing(false);
    } catch (err) { alert(err.message); }
  }

  const pct = Math.min((steps || 0) / target, 1);
  return (
    <section class="card">
      <header class="card-head"><h2>Pasos</h2></header>
      {editing ? (
        <form class="steps-edit" onSubmit={save}>
          <input ref={input} type="number" inputmode="numeric" min="0" value={value}
            onInput={(e) => setValue(e.currentTarget.value)} placeholder="Pasos del día" />
          <button class="btn primary">Guardar</button>
          <button type="button" class="link" onClick={() => setEditing(false)}>Cancelar</button>
        </form>
      ) : (
        <button class="metric-row as-btn" onClick={start} aria-label="Editar pasos">
          <span class="metric">👟 <b>{int(steps)}</b><span class="muted"> / {int(target)} pasos</span></span>
          <span class="muted">✎</span>
        </button>
      )}
      <div class="bar"><span style={`width:${pct * 100}%;background:var(--accent)`} /></div>
    </section>
  );
}

/* ------------------------------- Sueño ------------------------------- */
const hm = (h) => {
  const total = Math.round((Number(h) || 0) * 60);
  return `${Math.floor(total / 60)} h ${String(total % 60).padStart(2, '0')} min`;
};

export function SleepCard({ date, plan, sleep, log, onSave }) {
  const target = Number(plan?.sleep_target || 8);
  const [editing, setEditing] = useState(null); // null | 'total' | 'fases'
  const [h, setH] = useState('');
  const [m, setM] = useState('');
  const [st, setSt] = useState({});
  const staged = hasStages(log);
  const summary = stagesSummary(log);

  function start(mode) {
    const total = Math.round((Number(sleep) || 0) * 60);
    setH(sleep != null ? String(Math.floor(total / 60)) : '');
    setM(sleep != null ? String(total % 60) : '');
    const init = {};
    for (const s of STAGES) {
      const v = log?.[s.key];
      init[s.code] = v == null ? { h: '', m: '' } : { h: String(Math.floor(v / 60)), m: String(v % 60) };
    }
    setSt(init);
    setEditing(mode);
  }

  async function save(e) {
    e.preventDefault();
    try {
      if (editing === 'fases') {
        await onSave(stageFields(st));
      } else {
        const value = h === '' && m === '' ? null : Math.round(((Number(h) || 0) + (Number(m) || 0) / 60) * 100) / 100;
        await onSave({ sleep_h: value });
      }
      setEditing(null);
    } catch (err) { alert(err.message); }
  }

  const setStage = (code, k) => (e) => setSt({ ...st, [code]: { ...st[code], [k]: e.currentTarget.value } });
  const preview = editing === 'fases' ? stagesSummary(stageFields(st)) : null;
  const pct = Math.min((sleep || 0) / target, 1);
  const state = sleep == null ? '' : sleep >= target ? 'done' : sleep >= target - 1 ? 'near' : 'low';

  return (
    <section class="card">
      <header class="card-head"><h2>Sueño</h2><span class="muted">anoche</span></header>
      {editing === 'total' && (
        <form class="sleep-edit" onSubmit={save}>
          <label>Horas<input type="number" inputmode="numeric" min="0" max="24" value={h} onInput={(e) => setH(e.currentTarget.value)} autoFocus /></label>
          <label>Minutos<input type="number" inputmode="numeric" min="0" max="59" value={m} onInput={(e) => setM(e.currentTarget.value)} /></label>
          <button class="btn primary">Guardar</button>
          <button type="button" class="link" onClick={() => setEditing(null)}>Cancelar</button>
        </form>
      )}
      {editing === 'fases' && (
        <form class="stages-edit" onSubmit={save}>
          <p class="muted hint">Copia el tiempo de cada fase de Salud → Sueño → Fases. El total dormido se calcula solo (REM + ligero + profundo).</p>
          {STAGES.map((s) => (
            <div class="stage-row" key={s.code}>
              <span class="stage-name"><i style={`background:${s.color}`} />{s.label}<small class="muted"> {s.hint}</small></span>
              <input type="number" inputmode="numeric" min="0" max="24" placeholder="h" aria-label={`${s.label}, horas`} value={st[s.code]?.h} onInput={setStage(s.code, 'h')} />
              <input type="number" inputmode="numeric" min="0" max="59" placeholder="min" aria-label={`${s.label}, minutos`} value={st[s.code]?.m} onInput={setStage(s.code, 'm')} />
            </div>
          ))}
          {preview.totalMin > 0 && <p class="muted hint">Dormido: <b>{fmtMin(preview.asleepMin)}</b> · {preview.items.map((i) => `${i.label} ${i.pct} %`).join(' · ')}</p>}
          <div class="stage-actions">
            <button type="button" class="link" onClick={() => setEditing(null)}>Cancelar</button>
            <button class="btn primary">Guardar fases</button>
          </div>
        </form>
      )}
      {!editing && (
        <button class="metric-row as-btn" onClick={() => start(staged ? 'fases' : 'total')} aria-label="Editar sueño">
          <span class="metric">🌙 <b>{sleep != null ? hm(sleep) : '—'}</b><span class="muted"> / {target} h</span></span>
          <span class="muted">✎</span>
        </button>
      )}
      <div class={`bar sleep ${state}`}><span style={`width:${pct * 100}%`} /></div>

      {!editing && staged && summary.totalMin > 0 && (
        <div class="stages">
          <div class="stage-bar" role="img" aria-label={summary.items.map((i) => `${i.label} ${i.pct} %`).join(', ')}>
            {summary.items.filter((i) => i.min > 0).map((i) => <span key={i.code} style={`width:${(i.min / summary.totalMin) * 100}%;background:${i.color}`} />)}
          </div>
          <ul class="stage-legend">
            {summary.items.map((i) => (
              <li key={i.code}>
                <i style={`background:${i.color}`} />
                <span>{i.label}</span>
                <b>{fmtMin(i.min)}</b>
                <span class="muted">{i.pct} %</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!editing && (
        <button class="link" onClick={() => start('fases')}>{staged ? 'Editar fases del sueño' : '+ Agregar fases del sueño'}</button>
      )}
      {!editing && !staged && <p class="muted hint">Copia el dato de Sueño del Apple Watch (tiempo dormido, no tiempo en cama).</p>}
    </section>
  );
}

/* ------------------------------- Energía ------------------------------ */
export const ENERGY = [
  { v: 1, icon: '😫', label: 'Agotado' },
  { v: 2, icon: '😕', label: 'Bajo' },
  { v: 3, icon: '😐', label: 'Normal' },
  { v: 4, icon: '🙂', label: 'Bien' },
  { v: 5, icon: '😄', label: 'Excelente' },
];

export function EnergyCard({ energy, onSave }) {
  const [busy, setBusy] = useState(false);
  async function pick(v) {
    setBusy(true);
    try { await onSave({ energy: energy === v ? null : v }); } catch (err) { alert(err.message); }
    setBusy(false);
  }
  return (
    <section class="card">
      <header class="card-head"><h2>Energía</h2><span class="muted">¿cómo te sentiste hoy?</span></header>
      <div class="energy" role="radiogroup" aria-label="Energía del día">
        {ENERGY.map((e) => (
          <button key={e.v} role="radio" aria-checked={energy === e.v} class={energy === e.v ? 'on' : ''} disabled={busy} onClick={() => pick(e.v)}>
            <span class="e-icon" aria-hidden="true">{e.icon}</span>
            <span>{e.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
