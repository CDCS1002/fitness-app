import { useState } from 'preact/hooks';
import { dayTargets, kcalStatus } from '../lib/targets.js';
import { updatePlan } from '../lib/api.js';

const fmt = (n) => new Intl.NumberFormat('es', { useGrouping: 'always' }).format(Math.round(Number(n) || 0));

// Geometría del arco (semicírculo)
const W = 340, H = 200, CX = 170, CY = 182, R = 136;
function pt(frac) {
  const a = Math.PI * (1 - Math.min(Math.max(frac, 0), 1));
  return [CX + R * Math.cos(a), CY - R * Math.sin(a)];
}
function arc(f0, f1) {
  const [x0, y0] = pt(f0);
  const [x1, y1] = pt(f1);
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/** Medidor de kcal del día con el rango objetivo, más barras de macros. */
export function KcalMeter({ eaten, macros, plan, onPlanChange }) {
  const [editing, setEditing] = useState(false);
  const t = dayTargets(plan);
  const s = kcalStatus(Math.round(eaten), t);
  const max = Math.max(t.high * 1.2, eaten * 1.05, 1);
  const f = (v) => v / max;
  const [mx, my] = pt(f(eaten));
  const [lx, ly] = pt(f(t.low));
  const [hx, hy] = pt(f(t.high));

  return (
    <section class={`meter ${s.state}`}>
      {!plan ? <div class="meter-skeleton" /> : <><button class="meter-hit" onClick={() => setEditing(true)} aria-label="Editar metas de kcal y macros">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${fmt(eaten)} de ${fmt(t.kcal)} kcal. ${s.text}`}>
          <path d={arc(0, 1)} class="m-track" />
          <path d={arc(f(t.low), f(t.high))} class="m-range" />
          {eaten > 0 && <path d={arc(0, f(eaten))} class="m-fill" />}
          {[[lx, ly, t.low], [hx, hy, t.high]].map(([x, y, v]) => {
            const k = (r) => [CX + (x - CX) * r, CY + (y - CY) * r];
            const [x0, y0] = k(0.93), [x1, y1] = k(1.07), [tx, ty] = k(1.2);
            return (
              <g key={v}>
                <line x1={x0} y1={y0} x2={x1} y2={y1} class="m-tick" />
                <text x={tx} y={ty + 4} class="m-tick-label" text-anchor="middle">{fmt(v)}</text>
              </g>
            );
          })}
          <circle cx={mx} cy={my} r="11" class="m-knob" />
          {s.state === 'in' && <path d={`M ${mx - 4.5} ${my} l 3 3 l 6 -6`} class="m-check" />}
          <text x={CX} y={CY - 34} text-anchor="middle" class="m-value">
            {fmt(eaten)}<tspan class="m-target"> / {fmt(t.kcal)}</tspan>
          </text>
          <text x={CX} y={CY - 10} text-anchor="middle" class="m-unit">kcal{t.estimated ? ' · meta estimada' : ''}</text>
        </svg>
      </button>
      <p class="meter-status">{s.text}</p></>}

      <div class="macro-bars">
        {[['protein', 'Proteína'], ['carbs', 'Carbos'], ['fat', 'Grasa']].map(([k, label]) => {
          const v = macros[k] || 0;
          const pct = t[k] ? Math.min(v / t[k], 1) : 0;
          const over = t[k] && v > t[k] * 1.1;
          return (
            <div key={k} class={over ? 'over' : ''}>
              <span class="mb-label">{label}</span>
              <span class="mb-val"><b>{fmt(v)}</b> / {fmt(t[k])} g</span>
              <span class="bar"><span style={`width:${pct * 100}%`} /></span>
            </div>
          );
        })}
      </div>

      {editing && <GoalsSheet plan={plan} onClose={() => setEditing(false)} onSaved={(p) => { onPlanChange(p); setEditing(false); }} />}
    </section>
  );
}

function GoalsSheet({ plan, onClose, onSaved }) {
  const est = dayTargets({ targets: plan?.targets }).estimate;
  const val = (v) => (v == null ? '' : String(v));
  const [f, setF] = useState({
    kcal_target: val(plan?.kcal_target),
    kcal_tolerance_pct: val(plan?.kcal_tolerance_pct ?? 10),
    protein_target: val(plan?.protein_target),
    carbs_target: val(plan?.carbs_target),
    fat_target: val(plan?.fat_target),
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.currentTarget.value });
  const num = (v) => (v === '' ? null : Number(v));

  async function save(e) {
    e.preventDefault();
    if (!plan) return;
    setBusy(true);
    try {
      onSaved(await updatePlan(plan.id, {
        kcal_target: num(f.kcal_target),
        kcal_tolerance_pct: num(f.kcal_tolerance_pct) ?? 10,
        protein_target: num(f.protein_target),
        carbs_target: num(f.carbs_target),
        fat_target: num(f.fat_target),
      }));
    } catch (err) { alert(err.message); setBusy(false); }
  }

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet short" role="dialog" aria-modal="true">
        <header class="sheet-head">
          <b>Metas del día</b>
          <button class="link" onClick={onClose}>Cerrar</button>
        </header>
        <form class="sheet-body form" onSubmit={save}>
          <p class="muted hint">
            Déjalas vacías para usar la estimación según tus porciones
            ({est.kcal} kcal · {est.protein} g proteína · {est.carbs} g carbos · {est.fat} g grasa).
            Si tu nutricionista te da una meta, escríbela aquí.
          </p>
          <div class="grid2">
            <label>Meta de kcal<input type="number" inputmode="numeric" placeholder={String(est.kcal)} value={f.kcal_target} onInput={set('kcal_target')} /></label>
            <label>Margen del rango (±%)<input type="number" inputmode="numeric" value={f.kcal_tolerance_pct} onInput={set('kcal_tolerance_pct')} /></label>
          </div>
          <div class="grid3">
            <label>Proteína (g)<input type="number" inputmode="numeric" placeholder={String(est.protein)} value={f.protein_target} onInput={set('protein_target')} /></label>
            <label>Carbos (g)<input type="number" inputmode="numeric" placeholder={String(est.carbs)} value={f.carbs_target} onInput={set('carbs_target')} /></label>
            <label>Grasa (g)<input type="number" inputmode="numeric" placeholder={String(est.fat)} value={f.fat_target} onInput={set('fat_target')} /></label>
          </div>
          <button class="btn primary wide" disabled={busy || !plan}>{busy ? 'Guardando…' : 'Guardar metas'}</button>
        </form>
      </div>
    </div>
  );
}
