/**
 * Open Food Facts: búsqueda por código de barras y conversión a nuestro modelo.
 * API pública, sin llave. Valores por 100 g (o 100 ml en líquidos).
 */

const FIELDS = [
  'code', 'product_name', 'product_name_es', 'generic_name_es', 'brands', 'quantity',
  'serving_size', 'serving_quantity', 'categories_tags', 'nutriments', 'image_front_small_url',
].join(',');

/** Variantes del código: UPC-A (12) ↔ EAN-13 con 0 inicial. */
export function barcodeVariants(code) {
  const c = String(code).replace(/\D/g, '');
  const out = new Set([c]);
  if (c.length === 12) out.add('0' + c);
  if (c.length === 13 && c.startsWith('0')) out.add(c.slice(1));
  return [...out];
}

export async function fetchOFF(code, { signal } = {}) {
  for (const c of barcodeVariants(code)) {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=${FIELDS}`, { signal });
    if (res.status === 404) continue;
    if (!res.ok) throw new Error(`Open Food Facts respondió ${res.status}`);
    const json = await res.json();
    if (json.status === 1 && json.product) return { ...json.product, code: json.product.code || c };
  }
  return null;
}

const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const r2 = (v) => (v == null ? null : Math.round(v * 100) / 100);

/** Macros por 100 g; usa los valores por porción si OFF no trae los de 100 g. */
function per100(n, key, servingQty) {
  const v100 = num(n[`${key}_100g`]);
  if (v100 != null) return v100;
  const vs = num(n[`${key}_serving`]);
  return vs != null && servingQty > 0 ? (vs * 100) / servingQty : null;
}

const CATEGORY_GROUPS = [
  [/cheeses?$|quesos?$/, 'proteina'],
  [/(^|:)(milks?|yogurts?|dairy-drinks|fermented-milk|leches?)/, 'lacteo'],
  [/fruit-juices|(^|:)fruits?($|-based)|fruits-and-vegetables-based-drinks/, 'fruta'],
  [/(^|:)vegetables?($|-based)|salads?$/, 'vegetal'],
  [/meats?|poultr|fishes|seafood|tunas|eggs|protein-powders|sausages|hams/, 'proteina'],
  [/nuts|seeds|oils|butters|avocado|dressings|mayonnaises/, 'grasa'],
];

// Leches y yogures por el nombre, cuando Open Food Facts no trae categoría
// (no aplica a quesos, dulce de leche ni proteína en polvo).
const DAIRY_NAME = /\b(leche|yogh?urt?|yogur|kefir|milk)\b/i;
const NOT_DAIRY_NAME = /queso|cheese|dulce de leche|cajeta|polvo|powder|whey|helado|ice cream/i;
export const isDairyName = (name = '') => DAIRY_NAME.test(name) && !NOT_DAIRY_NAME.test(name);

/**
 * Lácteo con proteína añadida: trae más proteína de la que acompaña a su lactosa
 * (8 g por cada 12 g de carbohidratos en la lista); el extra cuenta como proteína.
 */
export const isProteinDairy = (m) => (m.protein || 0) >= 5 && (m.protein || 0) > ((m.carbs || 0) * 8 / 12) * 1.2;

/** Grupo principal: primero por categoría, luego por el nombre; si no, por el macro que más kcal aporta. */
export function guessGroup(categories = [], m, name = '') {
  for (const tag of [...categories].reverse()) {
    for (const [re, g] of CATEGORY_GROUPS) if (re.test(tag)) return g;
  }
  if (isDairyName(name)) return 'lacteo';
  const kp = (m.protein || 0) * 4, kc = (m.carbs || 0) * 4, kf = (m.fat || 0) * 9;
  if (kp >= kc && kp >= kf) return 'proteina';
  if (kf > kc) return 'grasa';
  return 'carbohidrato';
}

/** Convierte un producto de OFF en los campos del formulario de alimento nuevo. */
export function mapOFF(p) {
  const n = p.nutriments || {};
  const servingQty = num(p.serving_quantity);
  let kcal = per100(n, 'energy-kcal', servingQty);
  if (kcal == null) {
    const kj = per100(n, 'energy', servingQty) ?? per100(n, 'energy-kj', servingQty);
    if (kj != null) kcal = kj / 4.184;
  }
  const m = {
    kcal: r2(kcal),
    protein: r2(per100(n, 'proteins', servingQty)),
    carbs: r2(per100(n, 'carbohydrates', servingQty)),
    fat: r2(per100(n, 'fat', servingQty)),
    fiber: r2(per100(n, 'fiber', servingQty)),
  };
  const productName = (p.product_name_es || p.product_name || p.generic_name_es || '').trim();
  const primary = guessGroup(p.categories_tags || [], m, productName);
  // "1 galleta (24 g)" → "galleta"; "30 g" → "porción"
  const servingLabel = (p.serving_size || '')
    .replace(/\s*\(.*\)\s*$/, '')
    .replace(/^[\d.,/\s]+/, '')
    .trim();
  const isUnit = /^(g|gr|grs|gramos?|ml|mL|oz|cl|l)$/i.test(servingLabel);
  return {
    name: productName,
    brand: (p.brands || '').split(',')[0].trim(),
    barcode: p.code,
    primary_group: primary,
    protein_source: primary === 'lacteo' ? isProteinDairy(m) : primary !== 'proteina' && (m.protein || 0) >= 10,
    basis: '100',
    kcal: m.kcal ?? '',
    protein: m.protein ?? '',
    carbs: m.carbs ?? '',
    fat: m.fat ?? '',
    fiber: m.fiber ?? '',
    serving_label: servingQty > 0 ? (servingLabel && !isUnit ? servingLabel : 'porción') : '',
    serving_grams: servingQty > 0 ? servingQty : '',
    image: p.image_front_small_url || null,
    complete: m.kcal != null && m.protein != null && m.carbs != null && m.fat != null,
  };
}
