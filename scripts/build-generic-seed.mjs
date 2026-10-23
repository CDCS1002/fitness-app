// Genera supabase/seed/0007_generic_foods.sql desde generic_foods.json:
// alimentos genéricos con valores de referencia USDA FoodData Central (por 100 g)
// y grupo de intercambio según las listas centroamericanas. Idempotente.
import { readFileSync, writeFileSync } from 'node:fs';

const { foods, updates } = JSON.parse(readFileSync(new URL('../supabase/seed/generic_foods.json', import.meta.url), 'utf8'));
const q = (v) => (v == null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const match = (f) => `name = ${q(f.name)} and brand is null and state is not distinct from ${q(f.state)}`;

let sql = `-- Alimentos genéricos (frutas, vegetales, granos, semillas, carnes, lácteos).
-- Valores por 100 g de referencia USDA FoodData Central. Generado por scripts/build-generic-seed.mjs.
begin;
`;
for (const f of foods) {
  sql += `
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select ${q(f.name)}, null, ${q(f.state)}, ${q(f.category)}, ${q(f.primary_group)}, ${q(f.protein_source)}, ${f.kcal}, ${f.protein}, ${f.carbs}, ${f.fat}, ${q(f.fiber)}, 'tabla', true, null
where not exists (select 1 from public.foods where ${match(f)});
`;
  for (const m of f.measures) {
    sql += `insert into public.food_measures (food_id, label, grams, is_default)
select id, ${q(m.label)}, ${m.grams}, ${m.default} from public.foods where ${match(f)}
on conflict (food_id, label) do nothing;
`;
  }
}
sql += '\n-- Genéricos que estaban estimados desde Fitia: pasan a valores de tabla\n';
for (const u of updates) {
  sql += `update public.foods set kcal = ${u.kcal}, protein = ${u.protein}, carbs = ${u.carbs}, fat = ${u.fat}, fiber = ${q(u.fiber)}, source = 'tabla', verified = true
 where ${match(u)} and source = 'estimado';
`;
}
sql += 'commit;\n';
writeFileSync(new URL('../supabase/seed/0007_generic_foods.sql', import.meta.url), sql);
console.log(`OK: ${foods.length} alimentos, ${foods.reduce((n, f) => n + f.measures.length, 0)} medidas, ${updates.length} actualizaciones`);
