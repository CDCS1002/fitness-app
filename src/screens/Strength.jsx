import { useEffect, useMemo, useState } from 'preact/hooks';
import { listExercises, strengthUpTo } from '../lib/api.js';
import { analyze, plannedFor, fmtKg, ACTION_LABEL } from '../lib/strength.js';
import { fromISO } from '../lib/dates.js';
import { DayHeader } from '../components/DayHeader.jsx';
import { ROUTINE, isoDow } from '../lib/routine.js';
import { LogSet, ExercisePicker } from '../components/StrengthSheets.jsx';

const fmtSets = (ex, sets) => sets.map(Number).join(' / ') + (ex.measure === 'segundos' ? ' s' : '');
const int = (n) => new Intl.NumberFormat('es', { useGrouping: 'always' }).format(Math.round(n || 0));

export function Strength({ date, setDate }) {
  const [exercises, setExercises] = useState([]);
  const [entries, setEntries] = useState([]); // hasta la fecha, del más reciente al más antiguo
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // ejercicio abierto en la hoja de registro
  const [picking, setPicking] = useState(false);
  const [extra, setExtra] = useState([]); // ejercicios agregados a mano este día

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [ex, en] = await Promise.all([listExercises(), strengthUpTo(date)]);
      setExercises(ex);
      setEntries(en);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }
  useEffect(() => { load(); setExtra([]); }, [date]);

  const dow = isoDow(fromISO(date));
  const byId = useMemo(() => Object.fromEntries(exercises.map((e) => [e.id, e])), [exercises]);
  const todays = entries.filter((e) => e.day === date);
  const lastBefore = (exId) => entries.find((e) => e.exercise_id === exId && e.day < date) || null;
  const todayOf = (exId) => todays.find((e) => e.exercise_id === exId) || null;

  // Orden: lo ya registrado hoy, luego lo planeado para el día, luego lo agregado a mano
  const list = [];
  const seen = new Set();
  const push = (ex) => { if (ex && !seen.has(ex.id)) { seen.add(ex.id); list.push(ex); } };
  [...todays].reverse().forEach((e) => push(byId[e.exercise_id]));
  plannedFor(exercises, dow).forEach(push);
  extra.forEach((id) => push(byId[id]));

  const volume = todays.reduce((a, e) => {
    const ex = byId[e.exercise_id];
    return a + (ex && ex.measure !== 'segundos' ? Number(e.weight_kg) * e.sets.reduce((s, n) => s + Number(n), 0) : 0);
  }, 0);

  function onSaved(row, removed) {
    setEntries((list) => {
      const rest = list.filter((e) => e.id !== row.id);
      return removed ? rest : [row, ...rest];
    });
    setOpen(null);
  }

  return (
    <div class="app">
      <DayHeader date={date} setDate={setDate} title="Fuerza" />

      <main class="content">
        {error && <p class="error">{error}</p>}
        <section class="card routine">
          <span class="muted">Hoy toca</span>
          <h2>{ROUTINE[dow]}</h2>
          <div class="routine-stats">
            <span><b>{todays.length}</b> ejercicios</span>
            <span><b>{int(volume)}</b> kg de volumen</span>
          </div>
        </section>

        <section class="meal">
          <header><h2>Ejercicios</h2></header>
          {list.map((ex) => {
            const cur = todayOf(ex.id);
            const prev = lastBefore(ex.id);
            const a = cur ? analyze(ex, cur, prev) : prev ? analyze(ex, prev, null) : null;
            return (
              <button class={`entry ex-row ${cur ? 'done' : ''}`} key={ex.id} onClick={() => setOpen(ex)}>
                <span class={`ex-check ${cur ? 'on' : ''}`} aria-hidden="true">{cur ? '✓' : ''}</span>
                <span class="entry-main">
                  <span class="entry-name">{ex.name}</span>
                  {cur ? (
                    <span class="muted">
                      {fmtKg(cur.weight_kg)} kg · {fmtSets(ex, cur.sets)}
                      {a.change != null && a.change !== 0 && <span class={a.change > 0 ? 'up' : 'down'}> · {a.change > 0 ? '+' : ''}{fmtKg(a.change)}</span>}
                    </span>
                  ) : prev ? (
                    <span class="muted">Última: {fmtKg(prev.weight_kg)} kg · {fmtSets(ex, prev.sets)}</span>
                  ) : (
                    <span class="muted">{ex.muscle} · sin registros</span>
                  )}
                </span>
                <span class="entry-side">
                  {cur ? (
                    <span class={`badge ${a.action}`}>{ACTION_LABEL[a.action]}</span>
                  ) : prev ? (
                    <><span class="muted small">sugerido</span><b>{fmtKg(a.suggested)} kg</b></>
                  ) : null}
                </span>
              </button>
            );
          })}
          {!loading && list.length === 0 && <p class="empty muted">No hay ejercicios planeados para este día.</p>}
          <button class="wide-btn" onClick={() => setPicking(true)}>+ Otro ejercicio</button>
        </section>
      </main>

      {open && (
        <LogSet
          exercise={open}
          date={date}
          current={todayOf(open.id)}
          previous={lastBefore(open.id)}
          onClose={() => setOpen(null)}
          onSaved={onSaved}
        />
      )}
      {picking && (
        <ExercisePicker
          exercises={exercises}
          onClose={() => setPicking(false)}
          onPick={(ex, isNew) => {
            if (isNew) setExercises((l) => [...l, ex].sort((a, b) => a.name.localeCompare(b.name)));
            setExtra((l) => [...l, ex.id]);
            setPicking(false);
            setOpen(ex);
          }}
        />
      )}
    </div>
  );
}
