/**
 * Ejercicios parecidos a un nombre nuevo, para evitar duplicados en el catálogo común
 * ("Press banca" vs "Press de banca", "Curl biceps" vs "Curl de bíceps").
 */
const STOP = new Set(['de', 'del', 'con', 'en', 'la', 'el', 'los', 'las', 'a', 'al', 'y', 'e', 'para', 'por']);
const SYN = { mancuernas: 'mancuerna', barras: 'barra', poleas: 'polea', maquinas: 'maquina', piernas: 'pierna', biceps: 'bicep', triceps: 'tricep' };

export const normName = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export const tokens = (s) => normName(s).split(' ').filter((w) => w && !STOP.has(w)).map((w) => SYN[w] || w.replace(/s$/, ''));

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return Math.max(m, n);
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/** Parecido entre 0 y 1 (1 = mismo ejercicio). */
export function nameSimilarity(a, b) {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.length || !tb.length) return 0;
  const A = ta.join(' '), B = tb.join(' ');
  if (A === B) return 1;
  const sa = new Set(ta), sb = new Set(tb);
  const inter = [...sa].filter((w) => sb.has(w)).length;
  const jaccard = inter / new Set([...sa, ...sb]).size;
  const contains = [...sa].every((w) => sb.has(w)) || [...sb].every((w) => sa.has(w)) ? 0.85 : 0;
  const editRatio = 1 - lev(A, B) / Math.max(A.length, B.length);
  return Math.max(jaccard, contains, editRatio);
}

/** Hasta 5 ejercicios del catálogo parecidos al nombre; `exact` si es el mismo. */
export function similarExercises(name, exercises, threshold = 0.6) {
  return exercises
    .map((ex) => ({ ex, score: nameSimilarity(name, ex.name) }))
    .filter((x) => x.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => ({ ...x, exact: x.score === 1 }));
}
