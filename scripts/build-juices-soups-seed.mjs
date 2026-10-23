// Genera supabase/seed/0015_juices_soups.sql desde juices_soups.json:
// jugos naturales (100 % fruta o vegetal, valores USDA por 100 g) y cremas de vegetales caseras.
// Las cremas se calculan de su receta: macros por 100 g y porciones por 100 g (vegetal por los
// carbohidratos de los vegetales, harina por la papa, grasa por el aceite) para que la papa no
// cuente como vegetal. Idempotente.
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../supabase/seed/juices_soups.json', import.meta.url), 'utf8'));
const q = (v) => (v == null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const j = (o) => (o == null ? 'null' : `'${JSON.stringify(o)}'::jsonb`);
const r1 = (n) => Math.round(n * 10) / 10;
const r4 = (n) => Math.round(n * 10000) / 10000;
const match = (f) => `name = ${q(f.name)} and brand is null and state is not distinct from ${q(f.state)}`;

const JUICE_MEASURES = [
  { label: '1/2 taza', grams: 124, default: true },
  { label: 'vaso (250 ml)', grams: 250, default: false },
];
const SOUP_MEASURES = [
  { label: 'taza', grams: 245, default: true },
  { label: '1/2 taza', grams: 122, default: false },
  { label: 'plato hondo (1 1/2 taza)', grams: 365, default: false },
];
// Porción de referencia de la nutricionista: vegetal 5 g C, harina 15 g C, grasa 5 g G
const BASIS = { vegetal: 5, carbohidrato: 15, grasa: 5 };

export function soupFrom(recipe, ingredients) {
  const total = Object.values(recipe).reduce((a, g) => a + g, 0);
  const sum = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const portions = { vegetal: 0, carbohidrato: 0, grasa: 0 };
  for (const [k, grams] of Object.entries(recipe)) {
    const ing = ingredients[k];
    if (!ing) throw new Error(`Ingrediente desconocido: ${k}`);
    for (const m of Object.keys(sum)) sum[m] += (ing[m] * grams) / 100;
    if (ing.group === 'vegetal') portions.vegetal += (ing.carbs * grams) / 100 / BASIS.vegetal;
    if (ing.group === 'carbohidrato') portions.carbohidrato += (ing.carbs * grams) / 100 / BASIS.carbohidrato;
    if (ing.group === 'grasa') portions.grasa += (ing.fat * grams) / 100 / BASIS.grasa;
  }
  const per100 = Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, r1((v / total) * 100)]));
  const override = Object.fromEntries(Object.entries(portions).filter(([, v]) => v > 0).map(([k, v]) => [k, r4((v / total) * 100)]));
  return { ...per100, override, total };
}

const foods = [
  ...data.juices.map((x) => ({
    name: x.name, state: null, category: 'Jugos naturales', primary_group: x.group,
    kcal: x.kcal, protein: x.protein, carbs: x.carbs, fat: x.fat, fiber: x.fiber, override: null, source: x.source || 'tabla',
    measures: x.measures || JUICE_MEASURES,
  })),
  ...data.soups.map((s) => {
    const c = soupFrom(s.recipe, data.ingredients);
    return {
      name: s.name, state: null, category: 'Cremas y sopas', primary_group: 'vegetal',
      kcal: Math.round(c.kcal), protein: c.protein, carbs: c.carbs, fat: c.fat, fiber: c.fiber, override: c.override, source: 'tabla',
      measures: SOUP_MEASURES,
    };
  }),
];

let sql = `-- Jugos naturales y cremas de vegetales caseras. Generado por scripts/build-juices-soups-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql. Seguro de correr más de una vez.
begin;
`;
for (const f of foods) {
  sql += `
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select ${q(f.name)}, null, ${q(f.state)}, ${q(f.category)}, ${q(f.primary_group)}, false, ${f.kcal}, ${f.protein}, ${f.carbs}, ${f.fat}, ${q(f.fiber)}, ${j(f.override)}, ${q(f.source)}, ${f.source === 'tabla'}, null
where not exists (select 1 from public.foods where ${match(f)});
`;
  for (const m of f.measures) {
    sql += `insert into public.food_measures (food_id, label, grams, is_default)
select id, ${q(m.label)}, ${m.grams}, ${m.default} from public.foods where ${match(f)}
on conflict (food_id, label) do nothing;
`;
  }
}
sql += 'commit;\n';

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('../supabase/seed/0015_juices_soups.sql', import.meta.url), sql);
  console.log(`OK: ${data.juices.length} jugos, ${data.soups.length} cremas`);
}
export { foods };
