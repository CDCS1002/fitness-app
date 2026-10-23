import { useEffect, useState } from 'preact/hooks';
import { saveStrength, deleteStrength, exerciseHistory, createExercise } from '../lib/api.js';
import { analyze, markFor, fmtKg, stepFor, ACTION_LABEL, PROGRESSION } from '../lib/strength.js';
import { DAY_NAMES } from '../lib/routine.js';
import { fromISO } from '../lib/dates.js';

const unit = (ex) => (ex.measure === 'segundos' ? 's' : 'reps');

/* ------------------------- Registrar un ejercicio ------------------------- */
export function LogSet({ exercise: ex, date, current, previous, onClose, onSaved }) {
  const prevA = previous ? analyze(ex, previous, null) : null;
  const startSets = current?.sets || previous?.sets || [null, null, null];
  const [tab, setTab] = useState('registro');
  const [weight, setWeight] = useState(String(current?.weight_kg ?? prevA?.suggested ?? 0));
  const [sets, setSets] = useState(current ? current.sets.map(String) : startSets.map(() => ''));
  const [rpe, setRpe] = useState(current?.rpe ?? null);
  const [notes, setNotes] = useState(current?.notes || '');
  const [busy, setBusy] = useState(false);

  const nums = sets.map((s) => Number(s)).filter((n) => n > 0);
  const live = nums.length ? analyze(ex, { weight_kg: Number(weight) || 0, sets: nums }, previous) : null;
  const range = PROGRESSION[ex.measure] || PROGRESSION.reps;
  const step = stepFor(ex);

  const setAt = (i, v) => setSets(sets.map((s, j) => (j === i ? v : s)));

  async function save() {
    if (!nums.length) return;
    setBusy(true);
    try {
      const row = await saveStrength({
        id: current?.id,
        day: date,
        exercise_id: ex.id,
        weight_kg: Number(weight) || 0,
        sets: nums,
        rpe,
        notes: notes.trim() || null,
      });
      onSaved(row, false);
    } catch (err) { alert(err.message); setBusy(false); }
  }

  async function remove() {
    if (!confirm(`¿Eliminar el registro de ${ex.name}?`)) return;
    try { await deleteStrength(current.id); onSaved(current, true); } catch (err) { alert(err.message); }
  }

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true">
        <header class="sheet-head">
          <b class="ellipsis">{ex.name}</b>
          <button class="link" onClick={onClose}>Cerrar</button>
        </header>
        <div class="sheet-tabs seg">
          <button class={tab === 'registro' ? 'on' : ''} onClick={() => setTab('registro')}>Registro</button>
          <button class={tab === 'historial' ? 'on' : ''} onClick={() => setTab('historial')}>Historial</button>
        </div>

        {tab === 'historial' ? <History ex={ex} /> : (
          <div class="sheet-body form">
            <p class="muted hint">
              {ex.muscle} · tren {ex.body} · meta {range.min}–{range.max} {unit(ex)}
              {previous && <> · última vez {fmtKg(previous.weight_kg)} kg × {previous.sets.map(Number).join('/')}</>}
            </p>

            <label>{ex.measure === 'segundos' ? 'Peso extra (kg)' : 'Peso (kg)'}
              <div class="stepper big">
                <button type="button" aria-label="Menos peso" onClick={() => setWeight(String(Math.max(0, Math.round(((Number(weight) || 0) - step) * 10) / 10)))}>−</button>
                <input type="number" inputmode="decimal" step="any" value={weight} onInput={(e) => setWeight(e.currentTarget.value)} />
                <button type="button" aria-label="Más peso" onClick={() => setWeight(String(Math.round(((Number(weight) || 0) + step) * 10) / 10))}>+</button>
              </div>
            </label>
            {prevA && !current && prevA.action !== 'mantener' && (
              <p class={`hint ${prevA.action}`}>{ACTION_LABEL[prevA.action]}: la última vez {prevA.action === 'subir' ? 'completaste el rango' : 'quedaste por debajo del mínimo'}.</p>
            )}

            <div class="sets">
              {sets.map((s, i) => (
                <label key={i}>Serie {i + 1}
                  <input type="number" inputmode="numeric" placeholder={startSets[i] != null ? String(Number(startSets[i])) : unit(ex)}
                    value={s} onInput={(e) => setAt(i, e.currentTarget.value)} />
                </label>
              ))}
            </div>
            <div class="set-actions">
              {sets.length > 1 && <button type="button" class="link" onClick={() => setSets(sets.slice(0, -1))}>− Quitar serie</button>}
              {sets.length < 10 && <button type="button" class="link" onClick={() => setSets([...sets, ''])}>+ Agregar serie</button>}
            </div>

            <div>
              <span class="label-text">Esfuerzo percibido (RPE)</span>
              <div class="chips rpe">
                {[5, 6, 7, 8, 9, 10].map((n) => (
                  <button type="button" key={n} class={rpe === n ? 'on' : ''} onClick={() => setRpe(rpe === n ? null : n)}>{n}</button>
                ))}
              </div>
            </div>
            <label>Notas<input value={notes} onInput={(e) => setNotes(e.currentTarget.value)} placeholder="Opcional" /></label>

            {live && (
              <div class="portion-preview strength-preview">
                <span class={`badge ${live.action}`}>{ACTION_LABEL[live.action]}</span>
                <span>Próxima vez: <b>{fmtKg(live.suggested)} kg</b></span>
                <span class="muted">
                  Marca {fmtKg(live.mark)}{ex.measure === 'segundos' ? ' s' : ' kg'}
                  {live.change != null && ` (${live.change > 0 ? '+' : ''}${fmtKg(live.change)})`}
                  {live.volume != null && ` · volumen ${fmtKg(live.volume)} kg`}
                </span>
              </div>
            )}

            <button class="btn primary wide" disabled={busy || !nums.length} onClick={save}>
              {busy ? 'Guardando…' : current ? 'Guardar cambios' : 'Registrar'}
            </button>
            {current && <button type="button" class="link danger center" onClick={remove}>Eliminar registro</button>}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Historial por ejercicio --------------------------- */
function History({ ex }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { exerciseHistory(ex.id).then(setRows).catch(() => setRows([])); }, [ex.id]);
  if (!rows) return <div class="sheet-body lookup"><div class="spinner" /></div>;
  if (!rows.length) return <div class="sheet-body"><p class="muted empty">Todavía no hay registros de este ejercicio.</p></div>;

  const marks = rows.map((r) => markFor(ex, r.weight_kg, r.sets));
  const best = Math.max(...marks);
  return (
    <div class="sheet-body">
      <div class="history-head">
        <div><span class="muted">Mejor marca</span><b>{fmtKg(best)}{ex.measure === 'segundos' ? ' s' : ' kg'}</b></div>
        <div><span class="muted">Sesiones</span><b>{rows.length}</b></div>
        <div><span class="muted">Progreso</span><b>{marks.length > 1 ? `${marks.at(-1) - marks[0] >= 0 ? '+' : ''}${fmtKg(marks.at(-1) - marks[0])}` : '—'}</b></div>
      </div>
      <Sparkline values={marks} />
      <ul class="history">
        {[...rows].reverse().map((r) => (
          <li key={r.id}>
            <span>{fromISO(r.day).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
            <span>{fmtKg(r.weight_kg)} kg × {r.sets.map(Number).join(' / ')}</span>
            <span class="muted">{fmtKg(markFor(ex, r.weight_kg, r.sets))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sparkline({ values }) {
  if (values.length < 2) return null;
  const W = 320, H = 72, P = 6;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [P + (i * (W - 2 * P)) / (values.length - 1), H - P - ((v - min) * (H - 2 * P)) / span]);
  return (
    <svg class="spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolución de la marca">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" />)}
    </svg>
  );
}

/* ------------------------ Elegir o crear un ejercicio ------------------------ */
export function ExercisePicker({ exercises, onClose, onPick }) {
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = exercises.filter((e) => !e.archived && norm(`${e.name} ${e.muscle || ''}`).includes(norm(q.trim())));
  const groups = {};
  list.forEach((e) => { (groups[e.muscle || 'Otros'] ||= []).push(e); });

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true">
        {creating ? (
          <NewExercise initialName={q} onBack={() => setCreating(false)} onCreated={(ex) => onPick(ex, true)} />
        ) : (
          <>
            <header class="sheet-head">
              <input class="search" type="search" placeholder="Buscar ejercicio o músculo…" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
              <button class="link" onClick={onClose}>Cerrar</button>
            </header>
            <div class="sheet-body">
              {Object.entries(groups).sort().map(([g, items]) => (
                <div key={g}>
                  <p class="section-label">{g}</p>
                  {items.map((e) => (
                    <button class="result" key={e.id} onClick={() => onPick(e, false)}>
                      <span class="entry-main">
                        <span class="entry-name">{e.name}</span>
                        <span class="muted">{(e.days || []).map((d) => DAY_NAMES[d].slice(0, 3)).join(' · ') || 'sin día fijo'}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ))}
              <button class="btn ghost wide" onClick={() => setCreating(true)}>+ Crear ejercicio nuevo</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewExercise({ initialName, onBack, onCreated }) {
  const [f, setF] = useState({ name: initialName, muscle: '', body: 'superior', measure: 'reps', days: [] });
  const [busy, setBusy] = useState(false);
  const toggleDay = (d) => setF({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort() });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      onCreated(await createExercise({ ...f, name: f.name.trim(), muscle: f.muscle.trim() || null }));
    } catch (err) {
      alert(err.message.includes('duplicate') ? 'Ya tienes un ejercicio con ese nombre.' : err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <header class="sheet-head">
        <button class="link" onClick={onBack}>‹ Ejercicios</button>
        <b>Nuevo ejercicio</b>
      </header>
      <form class="sheet-body form" onSubmit={save}>
        <label>Nombre<input required value={f.name} onInput={(e) => setF({ ...f, name: e.currentTarget.value })} /></label>
        <label>Grupo muscular<input value={f.muscle} placeholder="Pecho, Espalda, Pierna…" onInput={(e) => setF({ ...f, muscle: e.currentTarget.value })} /></label>
        <div class="grid2">
          <label>Tren
            <select value={f.body} onChange={(e) => setF({ ...f, body: e.currentTarget.value })}>
              <option value="superior">Superior (+2,5 kg)</option>
              <option value="inferior">Inferior (+5 kg)</option>
              <option value="core">Core (+2,5 kg)</option>
            </select>
          </label>
          <label>Medida
            <select value={f.measure} onChange={(e) => setF({ ...f, measure: e.currentTarget.value })}>
              <option value="reps">Repeticiones</option>
              <option value="segundos">Segundos (isométrico)</option>
            </select>
          </label>
        </div>
        <div>
          <span class="label-text">Días habituales</span>
          <div class="chips">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button type="button" key={d} class={f.days.includes(d) ? 'on' : ''} onClick={() => toggleDay(d)}>{DAY_NAMES[d].slice(0, 3)}</button>
            ))}
          </div>
        </div>
        <button class="btn primary wide" disabled={busy || !f.name.trim()}>{busy ? 'Guardando…' : 'Crear y registrar'}</button>
      </form>
    </>
  );
}
