import { useEffect, useState } from 'preact/hooks';
import { moodsFor, dayContextRange } from '../lib/api.js';
import { getEmotion, INTENSITY, balance } from '../lib/emotions.js';
import { dayTone } from '../lib/moodReport.js';
import { fmtMin } from '../lib/sleep.js';
import { DayHeader } from '../components/DayHeader.jsx';
import { MoodSheet } from '../components/MoodSheet.jsx';

const hm = (t) => (t ? String(t).slice(0, 5) : '');
const TONE = { agradable: 'Día mayormente agradable', desagradable: 'Día mayormente difícil', mixto: 'Día mixto' };

export function Emotions({ date, setDate }) {
  const [moods, setMoods] = useState([]);
  const [ctx, setCtx] = useState({});
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState(null); // { kind, entry? }

  useEffect(() => {
    let alive = true;
    setError('');
    Promise.all([moodsFor(date), dayContextRange(date, date)])
      .then(([m, c]) => { if (alive) { setMoods(m); setCtx(c[date] || {}); } })
      .catch((err) => alive && setError(err.message.includes('mood_entries') ? 'Ejecuta la migración 0013 para activar esta sección.' : err.message));
    return () => { alive = false; };
  }, [date]);

  const dayEntry = moods.find((m) => m.kind === 'dia');
  const moments = moods.filter((m) => m.kind === 'momento').sort((a, b) => hm(a.at_time).localeCompare(hm(b.at_time)));
  const tone = dayTone(balance(moods.flatMap((m) => m.emotions || [])));

  function onSaved(row) {
    setMoods((l) => [...l.filter((x) => x.id !== row.id), row]);
    setSheet(null);
  }

  return (
    <div class="app">
      <DayHeader date={date} setDate={setDate} title="Emociones" />
      <main class="content">
        {error && <p class="error">{error}</p>}

        <section class="mood-actions">
          <button class="mood-action" onClick={() => setSheet({ kind: 'momento' })}>
            <span class="mood-ic" aria-hidden="true">◔</span>
            <b>¿Cómo me siento ahora?</b>
            <small class="muted">Una emoción de este momento, con hora</small>
          </button>
          <button class="mood-action" onClick={() => setSheet(dayEntry ? { kind: 'dia', entry: dayEntry } : { kind: 'dia' })}>
            <span class="mood-ic" aria-hidden="true">◑</span>
            <b>{dayEntry ? 'Editar mi día' : '¿Cómo me sentí hoy?'}</b>
            <small class="muted">Un resumen de todo el día</small>
          </button>
        </section>

        <DayContext ctx={ctx} tone={moods.length ? tone : null} />

        {dayEntry && (
          <section class="card mood-day">
            <header class="card-head"><h2>Resumen del día</h2></header>
            <MoodEntry entry={dayEntry} onOpen={() => setSheet({ kind: 'dia', entry: dayEntry })} />
          </section>
        )}

        <section class="meal">
          <header><h2>Momentos</h2></header>
          {moments.map((m) => <MoodEntry key={m.id} entry={m} onOpen={() => setSheet({ kind: 'momento', entry: m })} timeline />)}
          {!moments.length && <p class="empty muted">Aún no registras momentos este día.</p>}
        </section>
      </main>

      {sheet && (
        <MoodSheet date={date} kind={sheet.kind} entry={sheet.entry}
          onClose={() => setSheet(null)} onSaved={onSaved}
          onDeleted={(id) => { setMoods((l) => l.filter((x) => x.id !== id)); setSheet(null); }} />
      )}
    </div>
  );
}

function MoodEntry({ entry, onOpen, timeline }) {
  return (
    <button class={`mood-entry ${timeline ? 'tl' : ''}`} onClick={onOpen}>
      {timeline && <span class="mood-time">{hm(entry.at_time) || '—'}</span>}
      <span class="mood-body">
        <span class="mood-emos">
          {(entry.emotions || []).map((em) => {
            const x = getEmotion(em.id);
            return x ? (
              <span key={em.id} class="emo-chip" style={`--c:${x.core.color}`} title={INTENSITY[em.intensity]}>
                {x.node.name}<i class="dots">{'•'.repeat(em.intensity || 3)}</i>
              </span>
            ) : null;
          })}
        </span>
        {entry.areas?.length > 0 && <span class="muted small">{entry.areas.join(' · ')}</span>}
        {entry.note && <span class="mood-note">{entry.note}</span>}
      </span>
    </button>
  );
}

/** Lo demás del día, para ver los enlaces con sueño, energía, entrenamiento y alimentación. */
function DayContext({ ctx, tone }) {
  const items = [];
  if (ctx.sleepH != null) {
    const st = ctx.stages;
    items.push({ k: 'Sueño', v: fmtMin(ctx.sleepH * 60), s: st ? `REM ${fmtMin(st.rem || 0)} · profundo ${fmtMin(st.deep || 0)}` : null });
  }
  if (ctx.energy != null) items.push({ k: 'Energía', v: ['', 'Agotado', 'Bajo', 'Normal', 'Bien', 'Excelente'][ctx.energy] });
  items.push({ k: 'Entrenamiento', v: ctx.trained ? 'Sí' : 'No', s: [ctx.strengthExercises ? `${ctx.strengthExercises} ejercicios` : null, ctx.activeKcal ? `${Math.round(ctx.activeKcal)} kcal activas` : null].filter(Boolean).join(' · ') || null });
  if (ctx.kcal != null) items.push({ k: 'Alimentación', v: `${new Intl.NumberFormat('es').format(ctx.kcal)} kcal`, s: ctx.kcalInRange ? 'dentro del rango' : ctx.kcal < ctx.kcalLow ? 'debajo del rango' : 'arriba del rango', tone: ctx.kcalInRange ? 'up' : 'down' });
  return (
    <section class="card day-ctx">
      <header class="card-head">
        <h2>Tu día</h2>
        {tone && <span class={`tone ${tone}`}>{TONE[tone]}</span>}
      </header>
      <dl class="kv">
        {items.map((it) => (
          <div key={it.k}><dt>{it.k}</dt><dd class={it.tone || ''}>{it.v}</dd>{it.s && <small class="muted">{it.s}</small>}</div>
        ))}
      </dl>
    </section>
  );
}
