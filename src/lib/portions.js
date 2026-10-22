/**
 * Motor de porciones (sistema de equivalentes / intercambios).
 *
 * Calibrado con ejemplos de KG Nutrición:
 *   Pan 30 g (15 C, 1.2 G)            → 1 carbohidrato
 *   Pasta salsa blanca 80 g (14.2 C, 2.8 G) → 1 carbohidrato + ½ grasa
 *   Arroz con camarones 60 g (14.7 C, 3.4 P) → 1 carbohidrato + ½ proteína
 *   Aguacate 35 g (5.1 G, 2.7 C)      → 1 grasa
 *   Ensalada 140 g (4.8 C)            → 1 vegetal
 *   Pollo frito 200 g (53.6 P, 22.2 G) → 8 proteínas + 4.5 grasas
 *
 * Reglas:
 *  1. El grupo principal del alimento define sus porciones con su macro base
 *     (p. ej. carbohidrato = carbos ÷ 15) y "consume" los macros de referencia del grupo.
 *  2. La grasa restante siempre cuenta como porciones de grasa (÷ 5).
 *  3. Los carbos restantes cuentan como carbohidrato (÷ 15), salvo en grasas,
 *     vegetales y frutas (en esos grupos son parte del propio alimento).
 *  4. La proteína restante solo cuenta si el alimento es fuente de proteína
 *     (la proteína incidental del pan o la pasta no se suma).
 *  5. Si el alimento tiene `portions_override` (por 100 g), se usa tal cual.
 */

export const GROUP_ORDER = ['proteina', 'carbohidrato', 'grasa', 'lacteo', 'vegetal', 'fruta'];

export const DEFAULT_GROUPS = {
  proteina:     { name: 'Proteína',     basis_macro: 'protein', basis_grams: 7,  protein_ref: 7, carbs_ref: 0,  fat_ref: 0, color: '#e4572e' },
  carbohidrato: { name: 'Carbohidrato', basis_macro: 'carbs',   basis_grams: 15, protein_ref: 0, carbs_ref: 15, fat_ref: 0, color: '#f3a712' },
  grasa:        { name: 'Grasa',        basis_macro: 'fat',     basis_grams: 5,  protein_ref: 0, carbs_ref: 0,  fat_ref: 5, color: '#a8c686' },
  lacteo:       { name: 'Lácteo',       basis_macro: 'protein', basis_grams: 8,  protein_ref: 8, carbs_ref: 12, fat_ref: 2, color: '#4f9de0' },
  vegetal:      { name: 'Vegetal',      basis_macro: 'carbs',   basis_grams: 5,  protein_ref: 2, carbs_ref: 5,  fat_ref: 0, color: '#3fae6a' },
  fruta:        { name: 'Fruta',        basis_macro: 'carbs',   basis_grams: 15, protein_ref: 0, carbs_ref: 15, fat_ref: 0, color: '#d64f9a' },
};

const NO_SECONDARY_CARBS = new Set(['grasa', 'vegetal', 'fruta']);

/** Convierte filas de la tabla exchange_groups a un mapa por código. */
export function groupsFromRows(rows) {
  if (!rows?.length) return DEFAULT_GROUPS;
  const map = {};
  for (const r of rows) {
    map[r.code] = {
      name: r.name,
      basis_macro: r.basis_macro,
      basis_grams: Number(r.basis_grams),
      protein_ref: Number(r.protein_ref),
      carbs_ref: Number(r.carbs_ref),
      fat_ref: Number(r.fat_ref),
      color: r.color || DEFAULT_GROUPS[r.code]?.color,
    };
  }
  return map;
}

/** Macros de una cantidad en gramos de un alimento (valores por 100 g). */
export function macrosFor(food, grams) {
  const f = grams / 100;
  const v = (x) => (x == null ? null : Number(x) * f);
  return {
    kcal: v(food.kcal) ?? 0,
    protein: v(food.protein) ?? 0,
    carbs: v(food.carbs) ?? 0,
    fat: v(food.fat) ?? 0,
    fiber: v(food.fiber),
  };
}

/**
 * Porciones exactas (sin redondear) para un alimento y cantidad.
 * @returns {Record<string, number>} solo grupos con valor > 0
 */
export function portionsFor(food, grams, groups = DEFAULT_GROUPS) {
  const out = {};
  const add = (g, n) => { if (n > 0) out[g] = (out[g] || 0) + n; };

  if (food.portions_override && Object.keys(food.portions_override).length) {
    for (const [g, n] of Object.entries(food.portions_override)) add(g, Number(n) * grams / 100);
    return out;
  }

  const m = macrosFor(food, grams);
  const code = food.primary_group;
  const g = groups[code];
  if (!g) return out;

  const basis = { protein: m.protein, carbs: m.carbs, fat: m.fat }[g.basis_macro];
  const n = basis / g.basis_grams;
  add(code, n);

  let protein = Math.max(0, m.protein - n * g.protein_ref);
  let carbs = Math.max(0, m.carbs - n * g.carbs_ref);
  let fat = Math.max(0, m.fat - n * g.fat_ref);

  if (code !== 'grasa') add('grasa', fat / groups.grasa.basis_grams);
  if (!NO_SECONDARY_CARBS.has(code) && code !== 'carbohidrato') {
    add('carbohidrato', carbs / groups.carbohidrato.basis_grams);
  }
  if (food.protein_source && code !== 'proteina' && code !== 'lacteo') {
    add('proteina', protein / groups.proteina.basis_grams);
  }
  return out;
}

/** Redondeo a medias porciones, como en las listas de intercambio. */
export function roundHalf(n) {
  return Math.round(n * 2) / 2;
}

/** Porciones redondeadas, sin los grupos que quedan en 0. */
export function roundedPortions(portions) {
  const out = {};
  for (const g of GROUP_ORDER) {
    const r = roundHalf(portions[g] || 0);
    if (r > 0) out[g] = r;
  }
  return out;
}

/** Suma de porciones exactas de varios registros. */
export function sumPortions(entries) {
  const out = {};
  for (const e of entries) {
    for (const [g, n] of Object.entries(e.portions || {})) out[g] = (out[g] || 0) + Number(n);
  }
  return out;
}

/**
 * Suma de porciones redondeadas por registro: lo que se ve en cada alimento es lo
 * que cuenta en el día (la grasa incidental de 0.1 del arroz no se acumula).
 */
export function sumRoundedPortions(entries) {
  const out = {};
  for (const e of entries) {
    for (const [g, n] of Object.entries(roundedPortions(e.portions || {}))) out[g] = (out[g] || 0) + n;
  }
  return out;
}

/** "1 carbohidrato + ½ proteína" */
export function describePortions(portions, groups = DEFAULT_GROUPS) {
  const r = roundedPortions(portions);
  const parts = GROUP_ORDER.filter((g) => r[g]).map((g) => `${fmtHalf(r[g])} ${(groups[g]?.name || g).toLowerCase()}`);
  return parts.length ? parts.join(' + ') : 'libre';
}

export function fmtHalf(n) {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  if (!half) return String(whole);
  return whole === 0 ? '½' : `${whole}½`;
}
