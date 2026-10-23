import { GROUP_ORDER, DEFAULT_GROUPS, fmtHalf, roundHalf } from '../lib/portions.js';

/** Avance del día por grupo contra las metas del plan. */
export function PortionBoard({ totals, targets, groups }) {
  return (
    <section class="board" aria-label="Porciones del día">
      {[...GROUP_ORDER, ...((totals.azucar || 0) > 0 ? ['azucar'] : [])].map((g) => {
        // Azúcar no está en el plan: máximo 1 cucharadita salvo que el plan diga otra cosa
        const target = g === 'azucar' ? Number(targets?.azucar ?? 1) : Number(targets?.[g] || 0);
        const done = roundHalf(totals[g] || 0);
        const pct = target ? Math.min(done / target, 1) : 0;
        const state = !target ? 'none' : done > target ? 'over' : done === target ? 'done' : 'todo';
        return (
          <div class={`board-row ${state}`} key={g}>
            <span class="dot" style={`background:var(--g-${g})`} />
            <span class="board-name">{(groups[g] || DEFAULT_GROUPS[g])?.name || g}</span>
            <span class="board-bar"><span style={`width:${pct * 100}%;background:var(--g-${g})`} /></span>
            <span class="board-count">
              <b>{fmtHalf(done)}</b>
              <span class="muted"> / {target}{g === 'azucar' ? ' máx' : ''}</span>
            </span>
          </div>
        );
      })}
    </section>
  );
}
