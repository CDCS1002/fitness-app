/**
 * Catálogo de alimentos publicado con la app (public/catalog.json). Al abrir la app se
 * compara su versión con la última sincronizada en este dispositivo; si cambió, se agregan
 * los alimentos nuevos y se aplican las correcciones, sin bloquear la interfaz.
 *
 * Reglas para no pisar tus cambios:
 * - Cada alimento del catálogo guarda la huella (catalog_hash) de los valores con que se cargó.
 * - Si la huella en la base coincide con la del catálogo: no hay nada que hacer.
 * - Si cambió el catálogo y el alimento sigue con los valores de la última carga: se actualiza.
 * - Si tú lo editaste (sus valores ya no coinciden con su huella): se respeta tu versión.
 */

export const VALUE_FIELDS = ['name', 'brand', 'state', 'barcode', 'category', 'primary_group', 'protein_source',
  'kcal', 'protein', 'carbs', 'fat', 'fiber', 'portions_override', 'source', 'verified'];

const r4 = (n) => (n == null || n === '' ? null : Math.round(Number(n) * 10000) / 10000);
const sortObj = (o) => (o == null ? null : Object.fromEntries(Object.keys(o).sort().map((k) => [k, r4(o[k])])));
const NUM = new Set(['kcal', 'protein', 'carbs', 'fat', 'fiber']);

/** Representación estable de un alimento (orden de llaves, decimales y medidas normalizados). */
export function canonical(food) {
  const out = {};
  for (const k of VALUE_FIELDS) {
    const v = food[k];
    out[k] = NUM.has(k) ? r4(v) : k === 'portions_override' ? (v && Object.keys(v).length ? sortObj(v) : null)
      : k === 'protein_source' || k === 'verified' ? !!v : v ?? null;
  }
  out.measures = [...(food.measures || [])]
    .map((m) => ({ label: m.label, grams: r4(m.grams), is_default: !!m.is_default }))
    .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
  return out;
}

/** Huella FNV-1a (32 bits, hex) de la representación estable. */
export function hashFood(food) {
  const s = JSON.stringify(canonical(food));
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const slug = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const catalogKey = (f) => [slug(f.brand) || 'generico', slug(f.name), slug(f.state) || 'na'].join('.');

/** Versión del catálogo completo (cambia si cambia cualquier alimento). */
export function catalogVersion(items) {
  return hashFood({ name: items.map((i) => `${i.key}:${i.hash}`).join('|') });
}

const sameIdentity = (row, item) => row.name === item.name && (row.brand ?? null) === (item.brand ?? null) && (row.state ?? null) === (item.state ?? null);

/**
 * Decide qué hacer con cada alimento del catálogo.
 * @param items    alimentos del catálogo ({ key, hash, ...valores, measures })
 * @param existing filas de la base candidatas ({ id, catalog_key, catalog_hash, ...valores, measures })
 * @returns { inserts, updates, adopts, kept }
 */
export function planSync(items, existing) {
  const byKey = new Map(existing.filter((r) => r.catalog_key).map((r) => [r.catalog_key, r]));
  const used = new Set();
  const plan = { inserts: [], updates: [], adopts: [], kept: [] };
  for (const item of items) {
    const row = byKey.get(item.key);
    if (row) {
      used.add(row.id);
      if (row.catalog_hash === item.hash) continue;
      // Enlazado sin huella (difería al enlazarse) pero ahora coincide con el catálogo: se retoma
      if (!row.catalog_hash && hashFood(row) === item.hash) { plan.adopts.push({ id: row.id, item, hash: item.hash }); continue; }
      // Solo se corrige si sigue igual a como se cargó (no lo editaste tú)
      if (row.catalog_hash && hashFood(row) === row.catalog_hash) plan.updates.push({ id: row.id, item });
      else plan.kept.push({ id: row.id, item });
      continue;
    }
    // Ya existía de un script anterior o lo creaste tú: se enlaza sin duplicarlo
    const match = existing.find((r) => !r.catalog_key && !used.has(r.id)
      && ((item.barcode && r.barcode === item.barcode) || sameIdentity(r, item)));
    if (match) {
      used.add(match.id);
      plan.adopts.push({ id: match.id, item, hash: hashFood(match) === item.hash ? item.hash : null });
      continue;
    }
    plan.inserts.push(item);
  }
  return plan;
}

const FOOD_SELECT = `id,catalog_key,catalog_hash,created_by,${VALUE_FIELDS.join(',')},measures:food_measures(label,grams,is_default)`;
const pick = (item) => Object.fromEntries(VALUE_FIELDS.map((k) => [k, item[k] ?? (k === 'protein_source' || k === 'verified' ? false : null)]));

/** Aplica el plan en la base con la sesión del usuario. */
export async function applyPlan(supabase, plan, userId) {
  const check = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  const setMeasures = async (foodId, measures) => {
    check(await supabase.from('food_measures').delete().eq('food_id', foodId));
    if (measures?.length) {
      check(await supabase.from('food_measures').insert(measures.map((m) => ({ food_id: foodId, label: m.label, grams: m.grams, is_default: !!m.is_default }))));
    }
  };
  for (let i = 0; i < plan.inserts.length; i += 50) {
    const chunk = plan.inserts.slice(i, i + 50);
    const rows = check(await supabase.from('foods')
      .insert(chunk.map((it) => ({ ...pick(it), catalog_key: it.key, catalog_hash: it.hash, created_by: userId })))
      .select('id,catalog_key'));
    const idByKey = Object.fromEntries(rows.map((r) => [r.catalog_key, r.id]));
    const ms = chunk.flatMap((it) => (it.measures || []).map((m) => ({ food_id: idByKey[it.key], label: m.label, grams: m.grams, is_default: !!m.is_default })));
    if (ms.length) check(await supabase.from('food_measures').insert(ms));
  }
  for (const { id, item } of plan.updates) {
    check(await supabase.from('foods').update({ ...pick(item), catalog_hash: item.hash }).eq('id', id));
    await setMeasures(id, item.measures);
  }
  for (const { id, item, hash } of plan.adopts) {
    check(await supabase.from('foods').update({ catalog_key: item.key, catalog_hash: hash, created_by: userId }).eq('id', id));
  }
}

/**
 * Sincroniza el catálogo si su versión cambió desde la última vez en este dispositivo.
 * Nunca lanza: ante cualquier error (sin conexión, migración pendiente) lo intenta la próxima vez.
 */
export async function syncCatalog(supabase, userId, base = './') {
  const storeKey = `catalog:${userId}`;
  let stored = null;
  try { stored = localStorage.getItem(storeKey); } catch { /* sin almacenamiento */ }
  try {
    const v = await fetch(`${base}catalog-version.json`, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null));
    if (!v?.version || v.version === stored) return { skipped: true };
    const catalog = await fetch(`${base}catalog.json?v=${v.version}`).then((r) => r.json());
    const items = catalog.foods;
    const names = [...new Set(items.map((i) => i.name))];
    const keys = items.map((i) => i.key);
    const barcodes = items.map((i) => i.barcode).filter(Boolean);
    const check = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
    const found = new Map();
    for (let i = 0; i < names.length; i += 60) {
      for (const r of check(await supabase.from('foods').select(FOOD_SELECT).in('name', names.slice(i, i + 60)))) found.set(r.id, r);
    }
    for (let i = 0; i < keys.length; i += 60) {
      for (const r of check(await supabase.from('foods').select(FOOD_SELECT).in('catalog_key', keys.slice(i, i + 60)))) found.set(r.id, r);
    }
    if (barcodes.length) for (const r of check(await supabase.from('foods').select(FOOD_SELECT).in('barcode', barcodes))) found.set(r.id, r);
    // Solo alimentos genéricos o propios (no los de otros usuarios)
    const existing = [...found.values()].filter((r) => r.created_by == null || r.created_by === userId);
    const plan = planSync(items, existing);
    await applyPlan(supabase, plan, userId);
    try { localStorage.setItem(storeKey, v.version); } catch { /* sin almacenamiento */ }
    return { inserted: plan.inserts.length, updated: plan.updates.length, adopted: plan.adopts.length, kept: plan.kept.length };
  } catch (err) {
    console.warn('Catálogo: se reintentará al abrir la app.', err.message);
    return { error: err.message };
  }
}
