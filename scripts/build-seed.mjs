// Genera supabase/seed/0002_foods.sql a partir de supabase/seed/foods.json.
// Idempotente: no duplica alimentos (nombre + marca + estado) ni medidas.
import { readFileSync, writeFileSync } from 'node:fs';

const foods = JSON.parse(readFileSync(new URL('../supabase/seed/foods.json', import.meta.url), 'utf8'));
const q = (v) => (v == null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

let sql = `-- Carga inicial generada por scripts/build-seed.mjs (no editar a mano).
-- Valores por 100 g, estimados a partir de tus registros de Fitia (source = 'estimado').
-- Verifica los empacados contra su etiqueta y márcalos como verificados en la app.
begin;
`;

for (const f of foods) {
  const match = `name = ${q(f.name)} and brand is not distinct from ${q(f.brand ?? null)} and state is not distinct from ${q(f.state ?? null)}`;
  sql += `
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select ${q(f.name)}, ${q(f.brand ?? null)}, ${q(f.state ?? null)}, ${q(f.category ?? null)}, ${q(f.primary_group)}, ${q(!!f.protein_source)},
       ${q(f.kcal)}, ${q(f.protein)}, ${q(f.carbs)}, ${q(f.fat)}, ${q(f.fiber ?? null)}, 'estimado', null
where not exists (select 1 from public.foods where ${match});
`;
  for (const m of f.measures || []) {
    sql += `insert into public.food_measures (food_id, label, grams, is_default)
select id, ${q(m.label)}, ${q(m.grams)}, ${q(!!m.default)} from public.foods where ${match}
on conflict (food_id, label) do nothing;
`;
  }
}
sql += '\ncommit;\n';

writeFileSync(new URL('../supabase/seed/0002_foods.sql', import.meta.url), sql);
console.log(`OK: ${foods.length} alimentos, ${foods.reduce((n, f) => n + (f.measures?.length || 0), 0)} medidas`);
