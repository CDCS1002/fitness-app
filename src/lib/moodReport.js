/**
 * Resumen emocional de un período y su relación con sueño, energía, entrenamiento y
 * alimentación. Los patrones son observaciones (comparan promedios entre días), no causas.
 */
import { addDays } from './dates.js';
import { getEmotion, balance, WHEEL } from './emotions.js';

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

/** Clasifica un día por su balance emocional. */
export function dayTone(b) {
  if (b == null) return null;
  return b > 0.2 ? 'agradable' : b < -0.2 ? 'desagradable' : 'mixto';
}

/**
 * @param {object} p
 *  moods: registros (day, kind, at_time, emotions, areas, note, details)
 *  days:  contexto por fecha { sleepH, energy, trained, kcalInRange, stages? } (opcional)
 *  from, to: ISO
 */
export function buildMoodReport({ moods, days = {}, from, to }) {
  const inRange = moods.filter((m) => m.day >= from && m.day <= to);
  const byDay = {};
  for (const m of inRange) (byDay[m.day] ||= []).push(m);

  // Frecuencia por emoción base, por palabra y por área (ponderada por presencia)
  const cores = Object.fromEntries(WHEEL.map((c) => [c.id, 0]));
  const words = {};
  const intensities = [];
  const areas = {};
  let emotionCount = 0;
  for (const m of inRange) {
    for (const em of m.emotions || []) {
      const x = getEmotion(em.id);
      if (!x) continue;
      cores[x.core.id] += 1;
      emotionCount += 1;
      words[x.node.id] = (words[x.node.id] || 0) + 1;
      intensities.push(Number(em.intensity || 3));
    }
    for (const a of m.areas || []) areas[a] = (areas[a] || 0) + 1;
  }
  const coreDist = WHEEL.map((c) => ({ id: c.id, name: c.name, color: c.color, n: cores[c.id], pct: emotionCount ? Math.round((cores[c.id] / emotionCount) * 100) : 0 }))
    .filter((c) => c.n > 0).sort((a, b) => b.n - a.n);
  const topWords = Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([id, n]) => ({ id, name: getEmotion(id).node.name, core: getEmotion(id).core, n }));
  const topAreas = Object.entries(areas).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, n]) => ({ name, n }));

  // Línea por día con su contexto
  const timeline = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const ms = (byDay[d] || []).slice().sort((a, b) => (a.kind === 'dia') - (b.kind === 'dia') || String(a.at_time).localeCompare(String(b.at_time)));
    const ctx = days[d] || {};
    if (!ms.length && ctx.sleepH == null) continue;
    const b = ms.length ? balance(ms.flatMap((m) => m.emotions || [])) : null;
    timeline.push({ day: d, entries: ms, balance: b, tone: dayTone(b), ...ctx });
  }

  // Patrones: días agradables vs desagradables
  const withTone = timeline.filter((t) => t.tone === 'agradable' || t.tone === 'desagradable');
  const group = (tone) => withTone.filter((t) => t.tone === tone);
  const stats = (g) => ({
    days: g.length,
    sleepH: r1(avg(g.map((t) => t.sleepH).filter((x) => x != null))),
    energy: r1(avg(g.map((t) => t.energy).filter((x) => x != null))),
    trainedPct: g.length ? Math.round((g.filter((t) => t.trained).length / g.length) * 100) : null,
    kcalInRangePct: (() => { const k = g.filter((t) => t.kcalInRange != null); return k.length ? Math.round((k.filter((t) => t.kcalInRange).length / k.length) * 100) : null; })(),
  });
  const pos = stats(group('agradable'));
  const neg = stats(group('desagradable'));
  const enough = pos.days >= 3 && neg.days >= 3;

  return {
    from, to,
    entries: inRange.length,
    daysWithEntries: Object.keys(byDay).length,
    avgIntensity: r1(avg(intensities)),
    coreDist, topWords, topAreas, timeline,
    patterns: { enough, agradable: pos, desagradable: neg },
  };
}
