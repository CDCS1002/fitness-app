/**
 * Motor de porciones combinado.
 *
 * - Valor de cada porción: lista de intercambio de la nutricionista
 *   (Licda. María Paula Ruiz): harina 15 C · 3 P · 1 G; vegetal 5 C · 2 P;
 *   fruta 15 C; lácteo 12 C · 8 P (grasa según tipo); proteína 7 P (grasa según tipo);
 *   grasa 5 G; azúcar 5 C.
 * - Composición: USDA FoodData Central o la etiqueta, por gramos reales. Así el motor
 *   coincide con la lista donde sus medidas caseras son exactas y se corrige solo
 *   donde se quedan cortas (p. ej. ½ taza de arroz cocido ≈ 1,5 harinas).
 * - De KG Nutrición: la proteína incidental de harinas no suma; las leguminosas y los
 *   alimentos marcados como fuente de proteína sí.
 *
 * Reglas:
 *  1. El grupo principal define sus porciones con su macro base (harina = carbos ÷ 15,
 *     lácteo = lactosa ÷ 12 sin pasar de proteína ÷ 8, proteína = proteína ÷ 7…).
 *  2. La grasa que cada porción ya incluye no suma porciones de grasa:
 *     proteína hasta 8 g (magra 2, semigrasa 5, grasa 8), lácteo hasta 8 g
 *     (descremado ≤ 3, semidescremado 5, entero 8), harina 1 g. Solo el excedente
 *     cuenta como grasa (÷ 5): frituras, salsas, galletas, aderezos.
 *  3. Carbos excedentes: en proteínas cuentan como harina (empanizados); en lácteos,
 *     como azúcar (yogures endulzados). En grasas, vegetales y frutas son parte del alimento.
 *  4. La proteína excedente solo cuenta si el alimento es fuente de proteína
 *     (leguminosas, frutos secos, yogur griego, leches altas en proteína).
 *  5. `portions_override` (por 100 g) reemplaza el cálculo: equivalencias fijadas a mano.
 */

/** Los seis grupos del plan. */
export const GROUP_ORDER = ['proteina', 'carbohidrato', 'grasa', 'lacteo', 'vegetal', 'fruta'];
/** Todos los grupos, incluido azúcar (fuera del plan; se muestra solo si se consume). */
export const ALL_GROUPS = [...GROUP_ORDER, 'azucar'];

export const DEFAULT_GROUPS = {
  proteina:     { name: 'Proteína',     basis_macro: 'protein', basis_grams: 7,  protein_ref: 7, carbs_ref: 0,  fat_ref: 0, fat_cap: 8, color: '#e4572e', portion_kcal: 45, portion_protein: 7, portion_carbs: 0, portion_fat: 2 },
  carbohidrato: { name: 'Carbohidrato', basis_macro: 'carbs',   basis_grams: 15, protein_ref: 0, carbs_ref: 15, fat_ref: 0, fat_cap: 1, color: '#f3a712', portion_kcal: 80, portion_protein: 3, portion_carbs: 15, portion_fat: 1 },
  grasa:        { name: 'Grasa',        basis_macro: 'fat',     basis_grams: 5,  protein_ref: 0, carbs_ref: 0,  fat_ref: 5, fat_cap: 0, color: '#a8c686', portion_kcal: 45, portion_protein: 0, portion_carbs: 0, portion_fat: 5 },
  lacteo:       { name: 'Lácteo',       basis_macro: 'carbs',   basis_grams: 12, protein_ref: 8, carbs_ref: 12, fat_ref: 0, fat_cap: 8, color: '#4f9de0', portion_kcal: 100, portion_protein: 8, portion_carbs: 12, portion_fat: 1.5 },
  vegetal:      { name: 'Vegetal',      basis_macro: 'carbs',   basis_grams: 5,  protein_ref: 2, carbs_ref: 5,  fat_ref: 0, fat_cap: 0, color: '#3fae6a', portion_kcal: 25, portion_protein: 2, portion_carbs: 5, portion_fat: 0 },
  fruta:        { name: 'Fruta',        basis_macro: 'carbs',   basis_grams: 15, protein_ref: 0, carbs_ref: 15, fat_ref: 0, fat_cap: 0, color: '#d64f9a', portion_kcal: 60, portion_protein: 0, portion_carbs: 15, portion_fat: 0 },
  azucar:       { name: 'Azúcar',       basis_macro: 'carbs',   basis_grams: 5,  protein_ref: 0, carbs_ref: 5,  fat_ref: 0, fat_cap: 0, color: '#b48ead' },
};

/**
 * Configuración de grupos desde la tabla exchange_groups. Si la base aún no tiene
 * las columnas del motor combinado (fat_cap), se usan los valores del código.
 */
export function groupsFromRows(rows) {
  if (!rows?.length || !rows.some((r) => r.fat_cap != null)) return DEFAULT_GROUPS;
  const map = { ...DEFAULT_GROUPS };
  for (const r of rows) {
    map[r.code] = {
      name: r.name,
      basis_macro: r.basis_macro,
      basis_grams: Number(r.basis_grams),
      protein_ref: Number(r.protein_ref),
      carbs_ref: Number(r.carbs_ref),
      fat_ref: Number(r.fat_ref),
      fat_cap: Number(r.fat_cap ?? DEFAULT_GROUPS[r.code]?.fat_cap ?? 0),
      color: r.color || DEFAULT_GROUPS[r.code]?.color,
      portion_kcal: r.portion_kcal ?? DEFAULT_GROUPS[r.code]?.portion_kcal ?? null,
      portion_protein: r.portion_protein ?? DEFAULT_GROUPS[r.code]?.portion_protein ?? null,
      portion_carbs: r.portion_carbs ?? DEFAULT_GROUPS[r.code]?.portion_carbs ?? null,
      portion_fat: r.portion_fat ?? DEFAULT_GROUPS[r.code]?.portion_fat ?? null,
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
  const G = (code) => groups[code] || DEFAULT_GROUPS[code];

  if (food.portions_override && Object.keys(food.portions_override).length) {
    for (const [g, n] of Object.entries(food.portions_override)) add(g, Number(n) * grams / 100);
    return out;
  }

  const m = macrosFor(food, grams);
  const code = food.primary_group;
  const g = G(code);
  if (!g) return out;

  const basis = { protein: m.protein, carbs: m.carbs, fat: m.fat }[g.basis_macro];
  let n = basis / g.basis_grams;
  // Lácteo: por lactosa, pero sin pasar de lo que respalda su proteína (8 g por porción);
  // así el azúcar añadido de un yogur endulzado no se cuenta como más lácteo.
  if (code === 'lacteo' && m.protein > 0) n = Math.min(n, m.protein / g.protein_ref);
  add(code, n);

  const protein = Math.max(0, m.protein - n * g.protein_ref);
  const carbs = Math.max(0, m.carbs - n * g.carbs_ref);
  const fat = code === 'grasa' ? 0 : Math.max(0, m.fat - n * (g.fat_cap ?? 0));

  add('grasa', fat / G('grasa').basis_grams);
  if (code === 'proteina') add('carbohidrato', carbs / G('carbohidrato').basis_grams);
  if (code === 'lacteo') add('azucar', carbs / G('azucar').basis_grams);
  if (food.protein_source && code !== 'proteina') add('proteina', protein / G('proteina').basis_grams);
  return out;
}

/** Subtipo según la lista: proteína magra/semigrasa/grasa y lácteo descremado/semidescremado/entero. */
export function subtypeFor(food) {
  const p = Number(food.protein || 0), c = Number(food.carbs || 0), f = Number(food.fat || 0);
  if (food.primary_group === 'proteina' && p > 0) {
    const perPortion = (f / p) * 7;
    return perPortion <= 3 ? 'magra' : perPortion <= 6.5 ? 'semigrasa' : 'grasa';
  }
  if (food.primary_group === 'lacteo' && c > 0) {
    const perPortion = (f / c) * 12;
    return perPortion <= 3 ? 'descremado' : perPortion <= 6.5 ? 'semidescremado' : 'entero';
  }
  return null;
}

/** Redondeo a medias porciones, como en las listas de intercambio. */
export function roundHalf(n) {
  return Math.round(n * 2) / 2;
}

/** Porciones redondeadas, sin los grupos que quedan en 0. */
export function roundedPortions(portions) {
  const out = {};
  for (const g of ALL_GROUPS) {
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

/** "1 harina + ½ proteína" */
export function describePortions(portions, groups = DEFAULT_GROUPS) {
  const r = roundedPortions(portions);
  const parts = ALL_GROUPS.filter((g) => r[g]).map((g) => `${fmtHalf(r[g])} ${((groups[g] || DEFAULT_GROUPS[g])?.name || g).toLowerCase()}`);
  return parts.length ? parts.join(' + ') : 'libre';
}

export function fmtHalf(n) {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  if (!half) return String(whole);
  return whole === 0 ? '½' : `${whole}½`;
}
