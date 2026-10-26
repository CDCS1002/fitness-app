import { useEffect, useMemo, useState } from 'preact/hooks';
import { listExercises, strengthUpTo } from '../lib/api.js';
import { analyze, fmtKg, ACTION_LABEL } from '../lib/strength.js';
import { addDays, fromISO } from '../lib/dates.js';
import { weekStart } from '../lib/weekly.js';
import { DayHeader } from '../components/DayHeader.jsx';
import { DAY_NAMES, isoDow, exercisesForRoutine, routineForDay, missingThisWeek, isEveryDay } from '../lib/routine.js';
import { LogSet, ExercisePicker } from '../components/StrengthSheets.jsx';
import { RoutineEditor } from '../components/RoutineEditor.jsx';
import { useProfile } from '../lib/profile.js';

const fmtSets = (ex, sets) => sets.map(Number).join(' / ') + (ex.measure === 'segundos' ? ' s' : '');
const int = (n) => new Intl.NumberFormat('es', { useGrouping: 'always' }).format(Math.round(n || 0));

// Rutina elegida a mano por día (comodidad de este dispositivo; si se pierde, la rutina
// se deduce de los ejercicios registrados ese día).
const choiceKey = (day) => `routine:${day}`;
function readChoice(day) {
  try { const v = localStorage.getItem(choiceKey(day)); return v == null ? null : Number(v); } catch { return null; }
}
function writeChoice(day, key) {
  try { localStorage.setItem(choiceKey(day), String(key)); } catch { /* sin almacenamiento */ }
}

export function Strength({ date, setDate }) {
  const [exercises, setExercises] = useState([]);
  const [entries, setEntries] = useState([]); // hasta la fecha, del más reciente al más antiguo
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // ejercicio abierto en la hoja de registro
  const [picking, setPicking] = useState(false);
  const [extra, setExtra] = useState([]); // ejercicios agregados a mano este día
  const [choice, setChoice] = useState(() => readChoice(date));
  const [picker, setPicker] = useState(false);
  const [editor, setEditor] = useState(false);
  const profile = useProfile();
  const rt = profile.routines;
  const P = profile.progression;

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
  useEffect(() => { load(); setExtra([]); setChoice(readChoice(date)); setPicker(false); }, [date]);

  function choose(key) {
    writeChoice(date, key);
    setChoice(key);
    setPicker(false);
  }

  const dow = isoDow(fromISO(date));
  const byId = useMemo(() => Object.fromEntries(exercises.map((e) => [e.id, e])), [exercises]);
  const todays = entries.filter((e) => e.day === date);
  const lastBefore = (exId) => entries.find((e) => e.exercise_id === exId && e.day < date) || null;
  const todayOf = (exId) => todays.find((e) => e.exercise_id === exId) || null;

  const routine = routineForDay({ exercises, entries, day: date, dow, choice, rt });
  const isHabitual = routine === rt.habitual(dow);

  // Rutinas que tocaban antes en la semana y no se hicieron
  const weekDays = [];
  for (let d = weekStart(date); d <= date; d = addDays(d, 1)) weekDays.push(d);
  const choices = Object.fromEntries(weekDays.map((d) => [d, readChoice(d)]).filter(([, v]) => v));
  const missing = exercises.length && profile.ready ? missingThisWeek({ exercises, entries, weekDays, todayDow: dow, choices, rt }).filter((k) => k !== routine) : [];

  // Orden: lo ya registrado hoy, la rutina elegida (abdomen al final), lo agregado a mano
  const list = [];
  const seen = new Set();
  const push = (ex) => { if (ex && !seen.has(ex.id)) { seen.add(ex.id); list.push(ex); } };
  [...todays].reverse().forEach((e) => push(byId[e.exercise_id]));
  const planned = exercisesForRoutine(exercises, routine, rt);
  planned.filter((e) => !isEveryDay(e, rt)).forEach(push);
  extra.forEach((id) => push(byId[id]));
  planned.filter((e) => isEveryDay(e, rt)).forEach(push);
  const plannedLeft = planned.filter((e) => !todayOf(e.id)).length;

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
        {profile.error && <p class="error">{profile.error}</p>}
        <section class="card routine">
          <div class="routine-head">
            <span class="muted">{isHabitual ? 'Hoy toca' : `Rutina del día · en vez de ${rt.short(rt.habitual(dow)).toLowerCase()}`}</span>
            <span class="routine-links">
              <button class="link" onClick={() => setPicker(!picker)}>{picker ? 'Cerrar' : 'Cambiar'}</button>
              <button class="link" onClick={() => setEditor(true)} aria-label="Editar mi rutina">⚙︎ Rutina</button>
            </span>
          </div>
          <h2>{rt.name(routine)}</h2>
          {picker && (
            <div class="chips routine-chips" role="radiogroup" aria-label="Rutina del día">
              {rt.list.map((r) => (
                <button key={r.key} role="radio" aria-checked={routine === r.key} class={routine === r.key ? 'on' : ''} onClick={() => choose(r.key)}>
                  {r.name}{r.key >= 1 && <small class="muted"> · {DAY_NAMES[r.key].slice(0, 3).toLowerCase()}</small>}
                </button>
              ))}
            </div>
          )}
          <div class="routine-stats">
            <span><b>{todays.length}</b> hechos</span>
            {plannedLeft > 0 && <span><b>{plannedLeft}</b> pendientes</span>}
            <span><b>{int(volume)}</b> kg de volumen</span>
          </div>
        </section>

        {missing.length > 0 && (
          <section class="card missing">
            <div>
              <b>Esta semana te falta</b>
              <span class="muted">{missing.map((k) => `${rt.short(k)} (${DAY_NAMES[k].toLowerCase()})`).join(' · ')}</span>
            </div>
            <button class="btn primary" onClick={() => choose(missing[0])}>
              Hacer {rt.short(missing[0]).split(' · ')[0].toLowerCase()} hoy
            </button>
          </section>
        )}

        <section class="meal">
          <header><h2>Ejercicios</h2></header>
          {list.map((ex) => {
            const cur = todayOf(ex.id);
            const prev = lastBefore(ex.id);
            const a = cur ? analyze(ex, cur, prev, P) : prev ? analyze(ex, prev, null, P) : null;
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
                  {!cur && prev && <span class="muted small-tag">{ex.muscle}</span>}
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
          {!loading && list.length === 0 && (
            <p class="empty muted">{routine === 0 ? 'Día de descanso. Si quieres entrenar, toca «Cambiar» y elige una rutina.' : 'No hay ejercicios en el catálogo para esta rutina.'}</p>
          )}
          <button class="wide-btn" onClick={() => setPicking(true)}>+ Otro ejercicio</button>
        </section>
      </main>

      {open && (
        <LogSet
          exercise={open}
          progression={P}
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
          rt={rt}
          onClose={() => setPicking(false)}
          onPick={(ex, isNew) => {
            if (isNew) setExercises((l) => [...l, ex].sort((a, b) => a.name.localeCompare(b.name)));
            setExtra((l) => [...l, ex.id]);
            setPicking(false);
            setOpen(ex);
          }}
        />
      )}
      {editor && (
        <RoutineEditor
          exercises={exercises}
          onClose={() => setEditor(false)}
          onExercisesChanged={load}
        />
      )}
    </div>
  );
}
