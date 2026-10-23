import { useEffect, useState } from 'preact/hooks';
import { listPlans, listWeights, listInbody, progressRange, updatePlan } from '../lib/api.js';
import { buildDays } from '../lib/weekly.js';
import { buildReport } from '../lib/report.js';
import { DEFAULT_GROUPS } from '../lib/portions.js';
import { MAIN_METRICS, metricChange } from '../lib/inbody.js';
import { fromISO, today } from '../lib/dates.js';

const nf = (n, d = 0) => (n == null ? '—' : new Intl.NumberFormat('es', { maximumFractionDigits: d, minimumFractionDigits: d, useGrouping: 'always' }).format(n));
const nfi = (n) => (n == null ? '—' : new Intl.NumberFormat('es', { maximumFractionDigits: 2, useGrouping: 'always' }).format(n));
const sign = (n, d = 1) => (n == null ? '—' : `${n > 0 ? '+' : ''}${nf(n, d)}`);
const long = (iso) => fromISO(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
const short = (iso) => fromISO(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });
// Diferencia contra la meta: verde si se cumplió o se acercó (±0,5), ámbar si falta, rojo si se pasó
const tone = (d, tol = 0.5) => (d == null ? '' : Math.abs(d) <= tol ? 'good' : d < 0 ? 'warn' : 'bad');

export function Report({ onBack }) {
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(today());
  const [rep, setRep] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Planes: por defecto el vigente, desde su inicio hasta hoy (o su fin)
  useEffect(() => {
    listPlans().then((ps) => {
      setPlans(ps);
      const p = ps.find((x) => x.start_date <= today() && (!x.end_date || x.end_date >= today())) || ps[0];
      if (p) pickPlan(p);
    }).catch((err) => setError(err.message));
  }, []);

  function pickPlan(p) {
    setPlanId(p.id);
    setFrom(p.start_date);
    setTo(p.end_date && p.end_date < today() ? p.end_date : today());
  }

  useEffect(() => {
    if (!from || !to || from > to) return;
    let alive = true;
    setLoading(true);
    setError('');
    Promise.all([progressRange(from, to), listWeights(), listInbody()])
      .then(([r, weightsAll, scans]) => {
        if (!alive) return;
        setRep(buildReport({
          days: buildDays(r), plans: r.plans, from, to, exclude: today(),
          strength: r.strength, exercises: r.exercises, weightsAll, scans,
        }));
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [from, to]);

  const plan = plans.find((p) => p.id === planId) || null;

  return (
    <div class="app report">
      <header class="topbar">{onBack ? <button class="link no-print" onClick={onBack}>‹ Progreso</button> : <span />}<h1 class="page-title">Reporte de nutrición</h1><span /></header>
      <main class="content">
        {error && <p class="error">{error}</p>}

        <section class="card no-print">
          <div class="grid2">
            <label>Plan
              <select value={planId || ''} onChange={(e) => pickPlan(plans.find((p) => p.id === e.currentTarget.value))}>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name} · desde {short(p.start_date)}</option>)}
              </select>
            </label>
            <span />
            <label>Desde<input type="date" value={from || ''} max={to} onInput={(e) => setFrom(e.currentTarget.value)} /></label>
            <label>Hasta<input type="date" value={to} min={from || undefined} max={today()} onInput={(e) => setTo(e.currentTarget.value)} /></label>
          </div>
          <button class="btn primary wide" disabled={!rep} onClick={() => window.print()}>Exportar PDF / imprimir</button>
        </section>

        {plan && <VisitCard plan={plan} onSaved={(p) => setPlans((l) => l.map((x) => (x.id === p.id ? p : x)))} />}

        {loading && !rep && <div class="lookup"><div class="spinner" /></div>}
        {rep && <ReportBody rep={rep} plan={plan} />}
      </main>
    </div>
  );
}

/* ----------------------- Próxima cita y notas ----------------------- */
function VisitCard({ plan, onSaved }) {
  const [date, setDate] = useState(plan.next_visit || '');
  const [notes, setNotes] = useState(plan.visit_notes || '');
  const [state, setState] = useState('');
  useEffect(() => { setDate(plan.next_visit || ''); setNotes(plan.visit_notes || ''); }, [plan.id]);
  const dirty = (date || null) !== (plan.next_visit || null) || notes !== (plan.visit_notes || '');

  async function save() {
    setState('saving');
    try {
      onSaved(await updatePlan(plan.id, { next_visit: date || null, visit_notes: notes.trim() || null }));
      setState('saved');
    } catch (err) { alert(err.message); setState(''); }
  }

  const daysTo = date ? Math.round((fromISO(date) - fromISO(today())) / 864e5) : null;
  return (
    <section class="card visit">
      <header class="card-head">
        <h2>Próxima cita</h2>
        {daysTo != null && <span class="muted">{long(date)} · {daysTo > 0 ? `en ${daysTo} días` : daysTo === 0 ? 'hoy' : `hace ${-daysTo} días`}</span>}
      </header>
      <label class="no-print">Fecha<input type="date" value={date} onInput={(e) => { setDate(e.currentTarget.value); setState(''); }} /></label>
      <label>Notas y preguntas para la nutricionista
        <textarea rows="4" value={notes} placeholder="Ej.: los fines de semana me cuesta llegar a los vegetales…"
          onInput={(e) => { setNotes(e.currentTarget.value); setState(''); }} />
      </label>
      <p class="print-only notes-print">{notes || '—'}</p>
      {(dirty || state) && (
        <button class="btn primary wide no-print" disabled={!dirty || state === 'saving'} onClick={save}>
          {state === 'saving' ? 'Guardando…' : state === 'saved' && !dirty ? 'Guardado' : 'Guardar'}
        </button>
      )}
    </section>
  );
}

/* ------------------------------ Reporte ------------------------------ */
function ReportBody({ rep, plan }) {
  const f = rep.food;
  const a = rep.activity;
  const ib = rep.inbody;
  const ibPrev = (key) => ib.previous?.metrics?.[key] ?? null;

  return (
    <>
      <section class="card">
        <h2 class="print-title print-only">Reporte para la cita de nutrición</h2>
        <dl class="kv">
          <div><dt>Plan</dt><dd>{rep.plan?.name || plan?.name || '—'}</dd></div>
          <div><dt>Período</dt><dd>{long(rep.from)} – {long(rep.to)}</dd></div>
          <div><dt>Días del período</dt><dd>{rep.periodDays}</dd></div>
          <div><dt>Días registrados</dt><dd>{rep.loggedDays} <small class="muted">({nf((rep.loggedDays / rep.periodDays) * 100)} %)</small></dd></div>
        </dl>
        {rep.loggedDays === 0 && <p class="muted hint">No hay días con comida registrada en este período.</p>}
      </section>

      <section class="card">
        <h2>Alimentación <small class="muted">· promedio diario</small></h2>
        <table class="rt">
          <thead><tr><th>Indicador</th><th>Promedio</th><th>Meta</th><th>Dif.</th></tr></thead>
          <tbody>
            <tr><td>Kcal ingeridas</td><td>{nf(f.kcal)}</td><td>{nf(f.kcalLow)}–{nf(f.kcalHigh)}{f.kcalEstimated && '*'}</td>
              <td class={f.kcal == null ? '' : f.kcal < f.kcalLow ? 'warn' : f.kcal > f.kcalHigh ? 'bad' : 'good'}>{f.kcal == null ? '—' : sign(f.kcal - f.kcalTarget, 0)}</td></tr>
            <tr><td>Proteína (g)</td><td>{nf(f.protein)}</td><td>{nf(f.proteinTarget)}</td><td>{f.protein == null ? '—' : sign(f.protein - f.proteinTarget, 0)}</td></tr>
            <tr><td>Carbohidratos (g)</td><td>{nf(f.carbs)}</td><td>{nf(f.carbsTarget)}</td><td>{f.carbs == null ? '—' : sign(f.carbs - f.carbsTarget, 0)}</td></tr>
            <tr><td>Grasa (g)</td><td>{nf(f.fat)}</td><td>{nf(f.fatTarget)}</td><td>{f.fat == null ? '—' : sign(f.fat - f.fatTarget, 0)}</td></tr>
          </tbody>
        </table>
        <p class="section-label">Porciones del plan</p>
        <table class="rt">
          <thead><tr><th>Grupo</th><th>Promedio</th><th>Meta</th><th>Dif.</th></tr></thead>
          <tbody>
            {f.portions.map((p) => (
              <tr key={p.group}>
                <td><span class="dot" style={`background:var(--g-${p.group})`} /> {DEFAULT_GROUPS[p.group].name}</td>
                <td>{nf(p.avg, 1)}</td><td>{nf(p.target, 1)}</td><td class={tone(p.diff)}>{sign(p.diff)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl class="kv">
          <div><dt>Días con las 6 porciones en meta</dt><dd>{nf(f.allGroupsPct)} %</dd></div>
          <div><dt>Días dentro del rango de kcal</dt><dd>{f.daysInRange} de {rep.loggedDays}</dd></div>
        </dl>
        {f.kcalEstimated && <p class="muted hint">* Meta de kcal estimada a partir de las porciones del plan.</p>}
      </section>

      <section class="card">
        <h2>Actividad, sueño e hidratación <small class="muted">· promedio diario</small></h2>
        <table class="rt">
          <thead><tr><th>Indicador</th><th>Promedio</th><th>Meta</th><th>Dif.</th></tr></thead>
          <tbody>
            <tr><td>Kcal de entrenamiento</td><td>{nf(a.activeKcal)}</td><td>—</td><td>—</td></tr>
            {a.totalKcal != null && <tr><td>Gasto total (reloj)</td><td>{nf(a.totalKcal)}</td><td>—</td><td>—</td></tr>}
            {a.balance != null && <tr><td>Balance (comido − gastado)</td><td>{sign(a.balance, 0)}</td><td>—</td><td>—</td></tr>}
            <tr><td>Pasos</td><td>{nf(a.steps)}</td><td>{nf(a.stepsTarget)}</td><td class={tone(a.stepsDiff, 500)}>{sign(a.stepsDiff, 0)}</td></tr>
            <tr><td>Sueño (h)</td><td>{nf(a.sleep, 1)}</td><td>{nf(a.sleepTarget, 1)}</td><td class={tone(a.sleepDiff)}>{sign(a.sleepDiff)}</td></tr>
            <tr><td>Energía (1 a 5)</td><td>{nf(a.energy, 1)}</td><td>—</td><td>—</td></tr>
            <tr><td>Agua (L)</td><td>{nf(a.waterL, 2)}</td><td>{nf(a.waterTargetL, 2)}</td><td class={tone(a.waterDiff, 0.25)}>{sign(a.waterDiff, 2)}</td></tr>
            <tr><td>Cumplimiento de agua</td><td>{nf(a.waterPct)} %</td><td>100 %</td><td>—</td></tr>
          </tbody>
        </table>
        {a.balance != null && (
          <p class="muted hint">Balance promedio de {a.balanceDays} {a.balanceDays === 1 ? 'día' : 'días'} con comida y gasto registrados. En esos días equivale a ≈ {sign(a.expectedKg, 2)} kg (7,700 kcal ≈ 1 kg); compáralo con el cambio real de peso.</p>
        )}
      </section>

      <section class="card">
        <h2>Peso y fuerza</h2>
        <dl class="kv">
          <div><dt>Peso al inicio</dt><dd>{rep.weight.start ? `${nf(rep.weight.start.kg, 1)} kg` : '—'} {rep.weight.start && <small class="muted">({short(rep.weight.start.day)})</small>}</dd></div>
          <div><dt>Peso más reciente</dt><dd>{rep.weight.last ? `${nf(rep.weight.last.kg, 1)} kg` : '—'} {rep.weight.last && <small class="muted">({short(rep.weight.last.day)})</small>}</dd></div>
          <div><dt>Cambio de peso</dt><dd>{rep.weight.change != null ? `${sign(rep.weight.change)} kg` : '—'}</dd></div>
          <div><dt>Sesiones de fuerza</dt><dd>{rep.strength.sessions}</dd></div>
          <div><dt>Volumen total</dt><dd>{nf(rep.strength.volume)} kg</dd></div>
          <div><dt>Registros con subir carga</dt><dd>{rep.strength.upCount} de {rep.strength.entries}</dd></div>
        </dl>
        {rep.strength.top.length > 0 && (
          <>
            <p class="section-label">Ejercicios con más progreso (marca)</p>
            <table class="rt">
              <thead><tr><th>Ejercicio</th><th>Inicio</th><th>Último</th><th>Cambio</th></tr></thead>
              <tbody>
                {rep.strength.top.map((t) => (
                  <tr key={t.name}>
                    <td>{t.name}</td><td>{nf(t.first, 1)}</td><td>{nf(t.last, 1)}</td>
                    <td class={t.change > 0 ? 'good' : t.change < 0 ? 'bad' : ''}>{t.pct != null ? `${sign(t.pct, 0)} %` : sign(t.change)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p class="muted hint">Marca = 1RM estimado en kg (segundos en isométricos).</p>
          </>
        )}
      </section>

      {ib.last && (
        <section class="card">
          <h2>InBody <small class="muted">· {short(ib.last.day)}{ib.previous ? ` frente a ${short(ib.previous.day)}` : ''}</small></h2>
          <table class="rt">
            <thead><tr><th>Indicador</th><th>Anterior</th><th>Última</th><th>Cambio</th></tr></thead>
            <tbody>
              {MAIN_METRICS.map((m) => {
                const cur = ib.last.metrics?.[m.key] ?? null;
                if (cur == null) return null;
                const c = metricChange(m, cur, ibPrev(m.key));
                return (
                  <tr key={m.key}>
                    <td>{m.label}</td><td>{nfi(ibPrev(m.key))}</td><td>{nfi(cur)}</td>
                    <td class={c ? { good: 'good', bad: 'bad' }[c.tone] || '' : ''}>{c ? `${c.delta > 0 ? '+' : ''}${nfi(c.delta)}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {rep.weeks.length > 0 && (
        <section class="card">
          <h2>Detalle por semana</h2>
          <div class="rt-scroll">
            <table class="rt">
              <thead><tr><th>Semana</th><th>Días</th><th>Kcal</th><th>Grupos</th><th>Gasto</th><th>Balance</th><th>Sueño</th><th>Agua</th><th>Peso</th></tr></thead>
              <tbody>
                {rep.weeks.map((w) => (
                  <tr key={w.week}>
                    <td>{short(w.week)}</td><td>{w.daysLogged}</td><td>{nf(w.kcal)}</td><td>{nf(w.groupsOnTarget, 1)}</td>
                    <td>{w.totalKcal != null ? nf(w.totalKcal) : '—'}</td><td>{w.balance != null ? sign(w.balance, 0) : '—'}</td><td>{nf(w.sleep, 1)}</td><td>{nf(w.waterL, 2)}</td><td>{w.weight != null ? nf(w.weight, 1) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <p class="muted hint center">Generado el {long(today())} · el día de hoy no entra en los promedios.</p>
    </>
  );
}
