import { useEffect, useRef, useState } from 'preact/hooks';
import { addWater, setSteps, addActivity, deleteActivity } from '../lib/api.js';
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
