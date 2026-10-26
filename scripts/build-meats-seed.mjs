// Genera supabase/seed/0019_meats_legumes.sql desde meats_legumes.json: cortes de carne cocidos
// (proteína, con medidas de 1 oz y 3 oz) y cubaces. Valores USDA por 100 g. Idempotente.
import { readFileSync, writeFileSync } from 'node:fs';

const { foods, meat_measures } = JSON.parse(readFileSync(new URL('../supabase/seed/meats_legumes.json', import.meta.url), 'utf8'));
const q = (v) => (v == null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

export const rows = foods.map((f) => ({
  state: 'cocido', group: 'proteina', protein_source: false, fiber: 0, measures: meat_measures, ...f,
}));
const match = (f) => `name = ${q(f.name)} and brand is null and state is not distinct from ${q(f.state)}`;

let sql = `-- Cortes de carne (cocidos) y cubaces. Valores USDA por 100 g. Generado por scripts/build-meats-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql. Seguro de correr más de una vez.
begin;
`;
for (const f of rows) {
  sql += `
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select ${q(f.name)}, null, ${q(f.state)}, ${q(f.category)}, ${q(f.group)}, ${f.protein_source}, ${f.kcal}, ${f.protein}, ${f.carbs}, ${f.fat}, ${q(f.fiber)}, 'tabla', true, null
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
  writeFileSync(new URL('../supabase/seed/0019_meats_legumes.sql', import.meta.url), sql);
  console.log(`OK: ${rows.length} alimentos`);
}
