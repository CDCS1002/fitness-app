// Genera public/catalog.json y public/catalog-version.json desde supabase/catalog/foods.json.
// La app los lee al abrir y carga sola los alimentos nuevos (ver src/lib/catalog.js).
// Para agregar alimentos: añadirlos a supabase/catalog/foods.json y publicar. Se corre antes de cada build.
import { readFileSync, writeFileSync } from 'node:fs';
import { VALUE_FIELDS, hashFood, catalogKey, catalogVersion } from '../src/lib/catalog.js';

const GROUPS = ['proteina', 'carbohidrato', 'grasa', 'lacteo', 'vegetal', 'fruta', 'azucar'];
const SOURCES = ['manual', 'estimado', 'etiqueta', 'openfoodfacts', 'fatsecret', 'tabla', 'lista'];
const { foods } = JSON.parse(readFileSync(new URL('../supabase/catalog/foods.json', import.meta.url), 'utf8'));

const errors = [];
const items = foods.map((f, i) => {
  const where = `#${i + 1} ${f.name}`;
  if (!f.name) errors.push(`${where}: falta el nombre`);
  if (!GROUPS.includes(f.primary_group)) errors.push(`${where}: grupo inválido (${f.primary_group})`);
  if (!SOURCES.includes(f.source)) errors.push(`${where}: origen inválido (${f.source})`);
  if (f.state != null && !['crudo', 'cocido'].includes(f.state)) errors.push(`${where}: estado inválido (${f.state})`);
  for (const k of ['kcal', 'protein', 'carbs', 'fat']) if (typeof f[k] !== 'number' || f[k] < 0) errors.push(`${where}: ${k} inválido`);
  for (const m of f.measures || []) if (!m.label || !(m.grams > 0)) errors.push(`${where}: medida inválida`);
  const food = Object.fromEntries(VALUE_FIELDS.map((k) => [k, f[k] ?? (k === 'protein_source' || k === 'verified' ? false : null)]));
  food.measures = (f.measures || []).map((m) => ({ label: m.label, grams: m.grams, is_default: !!m.is_default }));
  return { key: catalogKey(food), hash: hashFood(food), ...food };
});
const keys = items.map((i) => i.key);
for (const k of keys.filter((k, i) => keys.indexOf(k) !== i)) errors.push(`Alimento repetido: ${k}`);
if (errors.length) throw new Error(`Catálogo con errores:\n${errors.join('\n')}`);

const version = catalogVersion(items);
writeFileSync(new URL('../public/catalog.json', import.meta.url), JSON.stringify({ version, foods: items }));
writeFileSync(new URL('../public/catalog-version.json', import.meta.url), JSON.stringify({ version, count: items.length }));
console.log(`Catálogo ${version}: ${items.length} alimentos`);
