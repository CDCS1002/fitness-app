import { WHEEL } from '../lib/emotions.js';

const SIZE = 300, C = SIZE / 2, R_IN = 54, R_OUT = 146;

function polar(r, a) {
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function sector(a0, a1) {
  const [x0, y0] = polar(R_OUT, a0), [x1, y1] = polar(R_OUT, a1);
  const [x2, y2] = polar(R_IN, a1), [x3, y3] = polar(R_IN, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 ${large} 0 ${x3} ${y3}Z`;
}

/** Parte el nombre en hasta 2 líneas para que quepa en el sector. */
function lines(name) {
  if (name.length <= 10 || !name.includes(' ')) return [name];
  const words = name.split(' ');
  let best = [name];
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    if (Math.max(a.length, b.length) < Math.max(...best.map((s) => s.length))) best = [a, b];
  }
  return best;
}

/**
 * Rueda por pasos: muestra los hijos del nodo actual (o las 6 base en la raíz).
 * Tocar un sector con hijos entra en él; tocar una hoja la elige. El centro vuelve atrás.
 */
export function EmotionWheel({ path, onOpen, onPick, onBack, selected }) {
  const node = path.at(-1) || null;
  const items = node ? node.children : WHEEL;
  const core = path[0] || null;
  const level = path.length;
  const opacity = [1, 0.8, 0.62][Math.min(level, 2)];
  const n = items.length;
  const start = -Math.PI / 2 - Math.PI / n;

  return (
    <svg class="wheel" viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label={node ? `Emociones dentro de ${node.name}` : 'Emociones base'}>
      {items.map((it, i) => {
        const a0 = start + (i * 2 * Math.PI) / n + 0.012;
        const a1 = start + ((i + 1) * 2 * Math.PI) / n - 0.012;
        const mid = (a0 + a1) / 2;
        const [lx, ly] = polar((R_IN + R_OUT) / 2 + (level === 0 ? 6 : 0), mid);
        const color = (core || it).color;
        const isSel = selected.has(it.id);
        const ls = lines(it.name);
        const leaf = !it.children?.length;
        return (
          <g key={it.id} class={`wheel-seg ${isSel ? 'sel' : ''}`} role="button" tabIndex={0}
            aria-label={`${it.name}${leaf ? ', elegir' : ', ver más'}`}
            onClick={() => (leaf ? onPick(it) : onOpen(it))}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (leaf ? onPick(it) : onOpen(it))}>
            <path d={sector(a0, a1)} fill={color} fill-opacity={opacity} />
            <text x={lx} y={ly - (ls.length - 1) * 7} text-anchor="middle" dominant-baseline="middle" class={`wheel-label l${level}`}>
              {ls.map((s, j) => <tspan key={j} x={lx} dy={j ? 14 : 0}>{s}</tspan>)}
            </text>
            {isSel && <circle cx={polar(R_OUT - 12, mid)[0]} cy={polar(R_OUT - 12, mid)[1]} r="7" class="wheel-check" />}
          </g>
        );
      })}
      <g class="wheel-center" role={node ? 'button' : undefined} tabIndex={node ? 0 : undefined} aria-label={node ? 'Volver' : undefined}
        onClick={() => node && onBack()} onKeyDown={(e) => node && e.key === 'Enter' && onBack()}>
        <circle cx={C} cy={C} r={R_IN - 6} />
        {node ? (
          <>
            <text x={C} y={C - 6} text-anchor="middle" class="wheel-center-name">{lines(node.name)[0]}</text>
            <text x={C} y={C + 14} text-anchor="middle" class="wheel-center-back">‹ volver</text>
          </>
        ) : (
          <text x={C} y={C + 5} text-anchor="middle" class="wheel-center-q">¿Qué sientes?</text>
        )}
      </g>
    </svg>
  );
}
