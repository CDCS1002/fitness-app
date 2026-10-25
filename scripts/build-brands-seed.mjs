// Genera supabase/seed/0016_brands_cr.sql desde brands_cr.json: productos de marca con los
// valores de su etiqueta por porción, convertidos a 100 g. Idempotente.
import { readFileSync, writeFileSync } from 'node:fs';

const { foods } = JSON.parse(readFileSync(new URL('../supabase/seed/brands_cr.json', import.meta.url), 'utf8'));
const q = (v) => (v == null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const r2 = (n) => (n == null ? null : Math.round(n * 100) / 100);
const match = (f) => `name = ${q(f.name)} and brand is not distinct from ${q(f.brand)} and state is null`;

export const rows = foods.map((f) => {
  const k = 100 / f.serving.grams;
  return { ...f, per100: { kcal: r2(f.kcal * k), protein: r2(f.protein * k), carbs: r2(f.carbs * k), fat: r2(f.fat * k), fiber: f.fiber == null ? null : r2(f.fiber * k) } };
});

let sql = `-- Productos de marca (Gricket House, Herbalife, Lizano, Rooster). Generado por scripts/build-brands-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql. Seguro de correr más de una vez.
begin;
`;
for (const f of rows) {
  const p = f.per100;
  sql += `
-- ${f.ref}
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select ${q(f.name)}, ${q(f.brand)}, null, ${q(f.category)}, ${q(f.primary_group)}, false, ${p.kcal}, ${p.protein}, ${p.carbs}, ${p.fat}, ${q(p.fiber)}, ${q(f.source)}, ${f.source === 'etiqueta'}, null
where not exists (select 1 from public.foods where ${match(f)});
insert into public.food_measures (food_id, label, grams, is_default)
select id, ${q(f.serving.label)}, ${f.serving.grams}, true from public.foods where ${match(f)}
on conflict (food_id, label) do nothing;
`;
}
sql += 'commit;\n';

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('../supabase/seed/0016_brands_cr.sql', import.meta.url), sql);
  console.log(`OK: ${rows.length} productos`);
}
