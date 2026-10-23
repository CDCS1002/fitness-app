// Genera supabase/seed/0010_list_foods.sql desde list_foods.json: alimentos de la lista de
// intercambio de la nutricionista. Genéricos con composición de referencia (USDA; yuca cocida
// según tabla TACO) y productos de marca con su equivalencia por unidad. Idempotente.
import { readFileSync, writeFileSync } from 'node:fs';

const foods = JSON.parse(readFileSync(new URL('../supabase/seed/list_foods.json', import.meta.url), 'utf8'));
const q = (v) => (v == null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const j = (o) => (o == null ? 'null' : `'${JSON.stringify(o)}'::jsonb`);
const match = (f) => `name = ${q(f.name)} and brand is not distinct from ${q(f.brand)} and state is not distinct from ${q(f.state)}`;

let sql = `-- Alimentos de la lista de intercambio de la nutricionista. Generado por scripts/build-list-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql.
begin;
`;
for (const f of foods) {
  sql += `
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select ${q(f.name)}, ${q(f.brand)}, ${q(f.state)}, ${q(f.category)}, ${q(f.primary_group)}, ${q(f.protein_source)}, ${f.kcal}, ${f.protein}, ${f.carbs}, ${f.fat}, ${q(f.fiber)}, ${j(f.override)}, ${q(f.source)}, ${f.source === 'tabla'}, null
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
writeFileSync(new URL('../supabase/seed/0010_list_foods.sql', import.meta.url), sql);
console.log(`OK: ${foods.length} alimentos`);
