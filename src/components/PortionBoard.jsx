import { GROUP_ORDER, fmtHalf, roundHalf } from '../lib/portions.js';

/** Avance del día por grupo contra las metas del plan. */
export function PortionBoard({ totals, targets, groups }) {
  return (
    <section class="board" aria-label="Porciones del día">
      {GROUP_ORDER.map((g) => {
        const target = Number(targets?.[g] || 0);
        const done = roundHalf(totals[g] || 0);
        const pct = target ? Math.min(done / target, 1) : 0;
        const state = !target ? 'none' : done > target ? 'over' : done === target ? 'done' : 'todo';
        return (
          <div class={`board-row ${state}`} key={g}>
            <span class="dot" style={`background:var(--g-${g})`} />
            <span class="board-name">{groups[g]?.name || g}</span>
            <span class="board-bar"><span style={`width:${pct * 100}%;background:var(--g-${g})`} /></span>
            <span class="board-count">
              <b>{fmtHalf(done)}</b>
              <span class="muted"> / {target}</span>
            </span>
          </div>
        );
      })}
    </section>
  );
}
