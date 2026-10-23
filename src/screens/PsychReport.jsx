import { useEffect, useState } from 'preact/hooks';
import { moodsRange, dayContextRange } from '../lib/api.js';
import { buildMoodReport } from '../lib/moodReport.js';
import { getEmotion, INTENSITY } from '../lib/emotions.js';
import { addDays, fromISO, today } from '../lib/dates.js';
import { fmtMin } from '../lib/sleep.js';

const long = (iso) => fromISO(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
const short = (iso) => fromISO(iso).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
const hm = (t) => (t ? String(t).slice(0, 5) : '');
const TONE = { agradable: 'Agradable', desagradable: 'Difícil', mixto: 'Mixto' };
const DETAIL_LABEL = { situacion: 'Situación', pensamiento: 'Pensamientos', cuerpo: 'En el cuerpo', accion: 'Qué hice' };

/** Reporte para la cita de psicología: emociones del período y su relación con sueño, energía, entrenamiento y alimentación. */
export function PsychReport({ onBack }) {
  const [from, setFrom] = useState(addDays(today(), -29));
  const [to, setTo] = useState(today());
  const [withNotes, setWithNotes] = useState(true);
  const [rep, setRep] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!from || !to || from > to) return;
    let alive = true;
    setError('');
    Promise.all([moodsRange(from, to), dayContextRange(from, to)])
      .then(([moods, days]) => alive && setRep(buildMoodReport({ moods, days, from, to })))
      .catch((err) => alive && setError(err.message));
    return () => { alive = false; };
  }, [from, to]);

  return (
    <div class="app report">
      <header class="topbar">
        <button class="link no-print" onClick={onBack}>‹ Progreso</button>
        <h1 class="page-title">Reporte para psicología</h1><span />
      </header>
      <main class="content">
        {error && <p class="error">{error}</p>}
        <section class="card no-print">
          <div class="pair">
            <label>Desde<input type="date" value={from} max={to} onInput={(e) => setFrom(e.currentTarget.value)} /></label>
            <label>Hasta<input type="date" value={to} min={from} max={today()} onInput={(e) => setTo(e.currentTarget.value)} /></label>
          </div>
          <label class="check"><input type="checkbox" checked={withNotes} onChange={(e) => setWithNotes(e.currentTarget.checked)} /> Incluir mis notas completas</label>
          <button class="btn primary wide" disabled={!rep} onClick={() => window.print()}>Exportar PDF / imprimir</button>
        </section>
        {rep && <Body rep={rep} withNotes={withNotes} />}
      </main>
    </div>
  );
}

function Body({ rep, withNotes }) {
  const p = rep.patterns;
  return (
    <>
      <section class="card">
        <h2 class="print-title print-only">Reporte emocional</h2>
        <dl class="kv">
          <div><dt>Período</dt><dd>{long(rep.from)} – {long(rep.to)}</dd></div>
          <div><dt>Días con registros</dt><dd>{rep.daysWithEntries}</dd></div>
          <div><dt>Registros</dt><dd>{rep.entries}</dd></div>
          <div><dt>Intensidad promedio</dt><dd>{rep.avgIntensity ?? '—'} <small class="muted">/ 5</small></dd></div>
        </dl>
      </section>

      {rep.coreDist.length > 0 && (
        <section class="card">
          <h2>Emociones del período</h2>
          <div class="core-bar" role="img" aria-label={rep.coreDist.map((c) => `${c.name} ${c.pct} %`).join(', ')}>
            {rep.coreDist.map((c) => <span key={c.id} style={`width:${c.pct}%;background:${c.color}`} />)}
          </div>
          <ul class="stage-legend">
            {rep.coreDist.map((c) => (
              <li key={c.id}><i style={`background:${c.color}`} /><span>{c.name}</span><b>{c.n}</b><span class="muted">{c.pct} %</span></li>
            ))}
          </ul>
          <p class="section-label">Las más frecuentes</p>
          <div class="mood-emos">
            {rep.topWords.map((w) => <span key={w.id} class="emo-chip" style={`--c:${w.core.color}`}>{w.name} · {w.n}</span>)}
          </div>
          {rep.topAreas.length > 0 && (
            <>
              <p class="section-label">Áreas que más aparecen</p>
              <p>{rep.topAreas.map((a) => `${a.name} (${a.n})`).join(' · ')}</p>
            </>
          )}
        </section>
      )}

      <section class="card">
        <h2>Relación con el resto del día</h2>
        {p.enough ? (
          <>
            <table class="rt">
              <thead><tr><th>Promedio</th><th>Días agradables</th><th>Días difíciles</th></tr></thead>
              <tbody>
                <tr><td>Días</td><td>{p.agradable.days}</td><td>{p.desagradable.days}</td></tr>
                <tr><td>Sueño</td><td>{p.agradable.sleepH != null ? `${p.agradable.sleepH} h` : '—'}</td><td>{p.desagradable.sleepH != null ? `${p.desagradable.sleepH} h` : '—'}</td></tr>
                <tr><td>Energía (1–5)</td><td>{p.agradable.energy ?? '—'}</td><td>{p.desagradable.energy ?? '—'}</td></tr>
                <tr><td>Entrenó</td><td>{p.agradable.trainedPct ?? '—'} %</td><td>{p.desagradable.trainedPct ?? '—'} %</td></tr>
                <tr><td>Kcal en rango</td><td>{p.agradable.kcalInRangePct ?? '—'} %</td><td>{p.desagradable.kcalInRangePct ?? '—'} %</td></tr>
              </tbody>
            </table>
            <p class="muted hint">Patrones observados en tus registros, no causas. Un día cuenta como agradable o difícil según el balance de sus emociones y su intensidad.</p>
          </>
        ) : (
          <p class="muted hint">Se necesitan al menos 3 días agradables y 3 difíciles en el período para comparar. Por ahora, revisa el detalle por día.</p>
        )}
      </section>

      <section class="card">
        <h2>Detalle por día</h2>
        {rep.timeline.filter((t) => t.entries.length).map((t) => (
          <div class="psy-day" key={t.day}>
            <div class="psy-day-head">
              <b>{short(t.day)}</b>
              {t.tone && <span class={`tone ${t.tone}`}>{TONE[t.tone]}</span>}
            </div>
            <p class="muted small">
              {[t.sleepH != null ? `Sueño ${fmtMin(t.sleepH * 60)}` : null,
                t.stages?.deep != null ? `profundo ${fmtMin(t.stages.deep)}` : null,
                t.energy != null ? `energía ${t.energy}/5` : null,
                t.trained ? 'entrenó' : 'sin entreno',
                t.kcal != null ? `${t.kcal} kcal${t.kcalInRange ? ' (en rango)' : ''}` : null].filter(Boolean).join(' · ')}
            </p>
            {t.entries.map((m) => (
              <div class="psy-entry" key={m.id}>
                <span class="mood-time">{m.kind === 'dia' ? 'Día' : hm(m.at_time)}</span>
                <div>
                  <div>{(m.emotions || []).map((em) => {
                    const x = getEmotion(em.id);
                    return x ? <span key={em.id} class="emo-chip" style={`--c:${x.core.color}`}>{x.node.name} · {INTENSITY[em.intensity]?.toLowerCase()}</span> : null;
                  })}</div>
                  {m.areas?.length > 0 && <p class="muted small">{m.areas.join(' · ')}</p>}
                  {withNotes && m.note && <p class="psy-note">{m.note}</p>}
                  {withNotes && Object.entries(m.details || {}).filter(([, v]) => v).map(([k, v]) => (
                    <p class="psy-note" key={k}><b>{DETAIL_LABEL[k] || k}:</b> {v}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        {!rep.entries && <p class="muted empty">No hay registros emocionales en este período.</p>}
      </section>
      <p class="muted hint center">Generado el {long(today())}.</p>
    </>
  );
}
