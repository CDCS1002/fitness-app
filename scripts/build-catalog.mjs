// Genera public/catalog.json y public/catalog-version.json a partir de los JSON de supabase/seed.
// La app los lee al abrir y carga sola los alimentos nuevos (ver src/lib/catalog.js).
// Para agregar alimentos: editar el JSON que corresponda y publicar. Se corre antes de cada build.
import { readFileSync, writeFileSync } from 'node:fs';
import { hashFood, catalogKey, catalogVersion } from '../src/lib/catalog.js';
import { foods as juicesSoups } from './build-juices-soups-seed.mjs';
import { rows as brands } from './build-brands-seed.mjs';
import { rows as meats } from './build-meats-seed.mjs';

const read = (f) => JSON.parse(readFileSync(new URL(`../supabase/seed/${f}`, import.meta.url), 'utf8'));
const r2 = (n) => (n == null ? null : Math.round(n * 100) / 100);
const ms = (list) => (list || []).map((m) => ({ label: m.label, grams: m.grams, is_default: !!(m.default ?? m.is_default) }));

const items = [];
const add = (f) => {
  const food = {
    name: f.name, brand: f.brand ?? null, state: f.state ?? null, barcode: f.barcode ?? null, category: f.category ?? null,
    primary_group: f.primary_group, protein_source: !!f.protein_source,
    kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat, fiber: f.fiber ?? null,
    portions_override: f.portions_override ?? null, source: f.source, verified: f.verified ?? f.source !== 'estimado',
    measures: ms(f.measures),
  };
  items.push({ key: catalogKey(food), hash: hashFood(food), ...food });
};

// 0015: jugos naturales y cremas de vegetales
for (const f of juicesSoups) add({ ...f, portions_override: f.override, verified: f.source === 'tabla' });
// 0016: marcas (Gricket House, Herbalife, Lizano, Rooster)
for (const f of brands) {
  add({ ...f, ...f.per100, primary_group: f.primary_group, verified: f.source === 'etiqueta',
    measures: [{ label: f.serving.label, grams: f.serving.grams, default: true }] });
}
// 0017: etiquetas (atún, Perform) y Great Value
const labels = read('label_foods.json');
for (const f of labels.foods) add({ ...f, verified: true });
for (const [name, state, category, group, psrc, label, grams, kcal, protein, carbs, fat] of labels.great_value.foods) {
  const k = 100 / grams;
  add({ name, brand: 'Great Value', state, category, primary_group: group, protein_source: psrc,
    kcal: r2(kcal * k), protein: r2(protein * k), carbs: r2(carbs * k), fat: r2(fat * k), fiber: null,
    source: 'estimado', verified: false, measures: [{ label, grams, default: true }] });
}
// 0019: carnes y cubaces
for (const f of meats) add({ ...f, primary_group: f.group, source: 'tabla', verified: true });

const dup = items.map((i) => i.key).filter((k, i, a) => a.indexOf(k) !== i);
if (dup.length) throw new Error(`Llaves repetidas en el catálogo: ${dup.join(', ')}`);

const version = catalogVersion(items);
writeFileSync(new URL('../public/catalog.json', import.meta.url), JSON.stringify({ version, foods: items }));
writeFileSync(new URL('../public/catalog-version.json', import.meta.url), JSON.stringify({ version, count: items.length }));
console.log(`Catálogo ${version}: ${items.length} alimentos`);
