import { useEffect, useState } from 'preact/hooks';
import { listWeights, saveWeight, deleteWeight, listInbody, progressRange } from '../lib/api.js';
import { buildDays, weeklySummary, weekStart, planFor } from '../lib/weekly.js';
import { dayTargets } from '../lib/targets.js';
import { MAIN_METRICS, INBODY_SECTIONS, metricChange } from '../lib/inbody.js';
import { addDays, fromISO, today } from '../lib/dates.js';
import { InbodyForm } from '../components/InbodyForm.jsx';

const WEEKS = 8;
const nf = (n, d = 0) => (n == null ? '—' : new Intl.NumberFormat('es', { maximumFractionDigits: d, minimumFractionDigits: 0, useGrouping: 'always' }).format(n));
const short = (iso) => fromISO(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });
const sign = (n, d = 1) => (n == null ? '' : `${n > 0 ? '+' : ''}${nf(n, d)}`);

export function Progress({ onSignOut }) {
  const [weights, setWeights] = useState([]);
  const [scans, setScans] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState(null); // 'weight' | {inbody: scan|null}

  async function load() {
    setError('');
    try {
      const to = today();
      const from = addDays(weekStart(to), -7 * (WEEKS - 1));
      const [w, s, r] = await Promise.all([listWeights(), listInbody(), progressRange(from, to)]);
      setWeights(w);
      setScans(s);
      setPlans(r.plans);
      setWeeks(weeklySummary(buildDays(r), r.plans, from, to, to).filter((x) => x.daysLogged || x.weight != null || x.strengthSessions));
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  return (
    <div class="app">
      <header class="topbar"><span /><h1 class="page-title">Progreso</h1><span /></header>
      <main class="content">
        {error && <p class="error">{error}</p>}
        <WeightCard weights={weights} scans={scans} onAdd={() => setSheet('weight')} />
        <WeeksCard weeks={weeks} plans={plans} />
        <InbodyCard scans={scans} onAdd={() => setSheet({ inbody: null })} onEdit={(s) => setSheet({ inbody: s })} />
        <footer class="foot">
          {plans[0] && <span class="muted">{plans[0].name} · desde {plans[0].start_date}</span>}
          <button class="link" onClick={onSignOut}>Cerrar sesión</button>
        </footer>
      </main>

      {sheet === 'weight' && (
        <WeightSheet
          weights={weights}
          onClose={() => setSheet(null)}
          onChanged={() => { setSheet(null); load(); }}
        />
      )}
      {sheet?.inbody !== undefined && (
        <InbodyForm
          scan={sheet.inbody}
          previous={scans.at(-1)}
          onClose={() => setSheet(null)}
          onSaved={() => { setSheet(null); load(); }}
        />
      )}
    </div>
  );
}

/* ------------------------------- Peso ------------------------------- */
function WeightCard({ weights, scans, onAdd }) {
  // Peso de la báscula + peso de cada InBody, en una sola serie por fecha
  const byDay = {};
  scans.forEach((s) => { if (s.metrics?.weight != null) byDay[s.day] = { day: s.day, kg: Number(s.metrics.weight), inbody: true }; });
  weights.forEach((w) => { byDay[w.day] = { day: w.day, kg: Number(w.weight_kg), inbody: false }; });
  const series = Object.values(byDay).sort((a, b) => (a.day < b.day ? -1 : 1));
  const last = series.at(-1);
  const prev = series.at(-2);
  const lastWeigh = weights.at(-1)?.day;
  const daysSince = lastWeigh ? Math.round((fromISO(today()) - fromISO(lastWeigh)) / 864e5) : null;

  return (
    <section class="card">
      <header class="card-head">
        <h2>Peso</h2>
        <button class="link" onClick={onAdd}>+ Registrar</button>
      </header>
      {last ? (
        <>
          <div class="metric-row">
            <span class="metric">⚖️ <b>{nf(last.kg, 1)}</b><span class="muted"> kg</span></span>
            {prev && <span class={last.kg - prev.kg <= 0 ? 'up' : 'down'}>{sign(Math.round((last.kg - prev.kg) * 10) / 10)} kg desde {short(prev.day)}</span>}
          </div>
          <LineChart points={series.map((p) => ({ x: p.day, y: p.kg, hollow: p.inbody }))} unit="kg" />
          <p class="muted hint">
            {daysSince != null && daysSince >= 7 ? `Tu último pesaje fue hace ${daysSince} días. ` : ''}
            Pésate una vez por semana, el mismo día, en la mañana y en ayunas. ○ = medición InBody.
          </p>
        </>
      ) : <p class="muted empty">Aún no hay pesos registrados.</p>}
    </section>
  );
}

function WeightSheet({ weights, onClose, onChanged }) {
  const [day, setDay] = useState(today());
  const existing = weights.find((w) => w.day === day);
  const [kg, setKg] = useState(existing ? String(existing.weight_kg) : weights.at(-1) ? String(weights.at(-1).weight_kg) : '');
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try { await saveWeight(day, Number(kg)); onChanged(); } catch (err) { alert(err.message); setBusy(false); }
  }
  async function remove() {
    if (!confirm('¿Eliminar el peso de ese día?')) return;
    try { await deleteWeight(day); onChanged(); } catch (err) { alert(err.message); }
  }

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet short" role="dialog" aria-modal="true">
        <header class="sheet-head"><b>Registrar peso</b><button class="link" onClick={onClose}>Cerrar</button></header>
        <form class="sheet-body form" onSubmit={save}>
          <div class="grid2">
            <label>Fecha<input type="date" required max={today()} value={day} onInput={(e) => setDay(e.currentTarget.value)} /></label>
            <label>Peso (kg)<input type="number" inputmode="decimal" step="0.1" min="20" max="400" required value={kg} onInput={(e) => setKg(e.currentTarget.value)} /></label>
          </div>
          <button class="btn primary wide" disabled={busy || !kg}>{busy ? 'Guardando…' : existing ? 'Actualizar' : 'Guardar'}</button>
          {existing && <button type="button" class="link danger center" onClick={remove}>Eliminar este registro</button>}
        </form>
      </div>
    </div>
  );
}

/* --------------------------- Resumen semanal --------------------------- */
function WeeksCard({ weeks, plans }) {
  const [open, setOpen] = useState(0);
  if (!weeks.length) return null;
  const tNow = dayTargets(planFor(plans, weeks[0].week) || plans[0]);
  const max = Math.max(...weeks.map((w) => w.kcal || 0), tNow.high) * 1.1;
  return (
    <section class="card">
      <header class="card-head"><h2>Semanas</h2><span class="muted small">promedio por día · sin hoy</span></header>
      <div class="week-bars" aria-hidden="true">
        <span class="wb-range" style={`bottom:calc(18px + ${(tNow.low / max) * 62}px);height:${((tNow.high - tNow.low) / max) * 62}px`} />
        {[...weeks].reverse().map((w) => {
          const ok = w.kcal != null && w.kcal >= tNow.low && w.kcal <= tNow.high;
          return (
            <div key={w.week} class="wb">
              <span class="wb-val">{nf(w.kcal)}</span>
              <span class="wb-bar"><span class={ok ? 'ok' : ''} style={`height:${((w.kcal || 0) / max) * 100}%`} /></span>
              <span class="wb-label">{short(w.week)}</span>
            </div>
          );
        })}
      </div>
      <p class="muted hint">La franja verde es tu rango de kcal ({nf(tNow.low)}–{nf(tNow.high)}).</p>
      {weeks.map((w, i) => {
        const t = dayTargets(planFor(plans, w.week) || plans[0]);
        const inRange = w.kcal != null && w.kcal >= t.low && w.kcal <= t.high;
        return (
          <div class={`week ${open === i ? 'open' : ''}`} key={w.week}>
            <button class="week-head" onClick={() => setOpen(open === i ? -1 : i)}>
              <span>
                <b>Semana del {short(w.week)}</b>
                <span class="muted"> · {w.daysLogged} {w.daysLogged === 1 ? 'día' : 'días'}</span>
              </span>
              <span class={inRange ? 'up' : 'muted'}>{nf(w.kcal)} kcal</span>
            </button>
            {open === i && (
              <dl class="week-grid">
                <div><dt>Kcal ingeridas</dt><dd>{nf(w.kcal)} <small>/ {nf(t.low)}–{nf(t.high)}</small></dd></div>
                <div><dt>Grupos en meta</dt><dd>{nf(w.groupsOnTarget, 1)} <small>/ 6</small></dd></div>
                <div><dt>Proteína</dt><dd>{nf(w.protein)} g</dd></div>
                <div><dt>Carbos · Grasa</dt><dd>{nf(w.carbs)} · {nf(w.fat)} g</dd></div>
                <div><dt>Kcal activas</dt><dd>{nf(w.activeKcal)}</dd></div>
                <div><dt>Pasos</dt><dd>{nf(w.steps)}</dd></div>
                <div><dt>Agua</dt><dd>{nf(w.waterL, 2)} L <small>({nf(w.waterPct)} %)</small></dd></div>
                {w.sleep != null && <div><dt>Sueño · Energía</dt><dd>{nf(w.sleep, 1)} h · {nf(w.energy, 1)}</dd></div>}
                <div><dt>Peso</dt><dd>{w.weight != null ? `${nf(w.weight, 1)} kg` : '—'} {w.weightChange != null && <small class={w.weightChange <= 0 ? 'up' : 'down'}>{sign(w.weightChange)}</small>}</dd></div>
                <div><dt>Fuerza</dt><dd>{w.strengthSessions} ses. · {nf(w.strengthVolume)} kg</dd></div>
              </dl>
            )}
          </div>
        );
      })}
    </section>
  );
}

/* ------------------------------- InBody ------------------------------- */
function InbodyCard({ scans, onAdd, onEdit }) {
  const [all, setAll] = useState(false);
  const last = scans.at(-1);
  const prev = scans.at(-2);
  const val = (s, k) => (s?.metrics?.[k] ?? null);

  const row = (m) => {
    const v = val(last, m.key);
    const p = prev ? (() => {
      // Último valor anterior disponible para ese indicador
      for (let i = scans.length - 2; i >= 0; i--) if (val(scans[i], m.key) != null) return val(scans[i], m.key);
      return null;
    })() : null;
    const c = metricChange(m, v, p);
    return { v, c };
  };

  return (
    <section class="card">
      <header class="card-head">
        <h2>InBody</h2>
        <button class="link" onClick={onAdd}>+ Medición</button>
      </header>
      {!last ? <p class="muted empty">Aún no hay mediciones.</p> : (
        <>
          <button class="muted hint as-link" onClick={() => onEdit(last)}>
            Última: {fromISO(last.day).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
            {prev && ` · comparada con ${short(prev.day)}`} · editar
          </button>
          <div class="ib-grid">
            {MAIN_METRICS.map((m) => {
              const { v, c } = row(m);
              return (
                <div key={m.key}>
                  <span class="muted">{m.label}</span>
                  <b>{v == null ? '—' : nf(v, 2)}<small> {m.unit}</small></b>
                  {c && c.delta !== 0 && <small class={`chg ${c.tone}`}>{sign(c.delta, 2)}</small>}
                </div>
              );
            })}
          </div>
          <button class="link center" onClick={() => setAll(!all)}>{all ? 'Ocultar indicadores' : 'Ver todos los indicadores'}</button>
          {all && INBODY_SECTIONS.map((s) => (
            <div key={s.name} class="ib-section">
              <p class="section-label">{s.name}</p>
              {s.metrics.map((m) => {
                const { v, c } = row(m);
                if (v == null) return null;
                return (
                  <div class="ib-row" key={m.key}>
                    <span>{m.label}{m.unit && <small class="muted"> {m.unit}</small>}</span>
                    <span class="muted small">{m.ref || ''}</span>
                    <span><b>{nf(v, 2)}</b> {c && c.delta !== 0 && <small class={`chg ${c.tone}`}>{sign(c.delta, 2)}</small>}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}
    </section>
  );
}

/* --------------------------- Gráfica de línea --------------------------- */
function LineChart({ points, unit }) {
  if (points.length < 2) return null;
  const W = 340, H = 120, PX = 8, PY = 14;
  const ys = points.map((p) => p.y);
  const min = Math.min(...ys), max = Math.max(...ys);
  const pad = Math.max((max - min) * 0.15, 0.5);
  const lo = min - pad, hi = max + pad;
  const t0 = fromISO(points[0].x).getTime(), t1 = fromISO(points.at(-1).x).getTime();
  const X = (x) => PX + ((fromISO(x).getTime() - t0) / (t1 - t0 || 1)) * (W - 2 * PX);
  const Y = (y) => PY + ((hi - y) / (hi - lo)) * (H - 2 * PY);
  return (
    <svg class="line-chart" viewBox={`0 0 ${W} ${H + 16}`} role="img" aria-label={`Evolución del peso en ${unit}`}>
      <polyline points={points.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} />
      {points.map((p) => (
        <g key={p.x}>
          <circle cx={X(p.x)} cy={Y(p.y)} r="4" class={p.hollow ? 'hollow' : ''} />
        </g>
      ))}
      <text x={PX} y={H + 12} class="lc-label">{short(points[0].x)}</text>
      <text x={W - PX} y={H + 12} class="lc-label" text-anchor="end">{short(points.at(-1).x)}</text>
      <text x={W - PX} y={Y(max) - 6} class="lc-label" text-anchor="end">{nf(max, 1)}</text>
      <text x={W - PX} y={Y(min) + 14} class="lc-label" text-anchor="end">{nf(min, 1)}</text>
    </svg>
  );
}
