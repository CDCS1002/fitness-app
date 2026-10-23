// Genera supabase/seed/0005_progress_import.sql desde progress_history.json
// (hojas Diario e InBody del Google Sheet). Idempotente: no pisa datos que ya existan.
import { readFileSync, writeFileSync } from 'node:fs';

const { scans, days, weights } = JSON.parse(readFileSync(new URL('../supabase/seed/progress_history.json', import.meta.url), 'utf8'));
const q = (v) => (v == null ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const j = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

let sql = `-- Importa peso, InBody y los días 13–21 de octubre del Google Sheet.
-- Generado por scripts/build-progress-seed.mjs. Ejecutar después de 0005_progress.sql.
do $$
declare uid uuid;
begin
  if (select count(*) from auth.users) <> 1 then
    raise exception 'Se esperaba exactamente 1 usuario en auth.users; ajusta el script';
  end if;
  select id into uid from auth.users limit 1;
`;
for (const s of scans) {
  sql += `  insert into public.inbody_scans (user_id, day, metrics, notes) values (uid, ${q(s.day)}, ${j(s.metrics)}, ${q(s.notes)}) on conflict (user_id, day) do nothing;\n`;
}
for (const w of weights) {
  sql += `  insert into public.body_weights (user_id, day, weight_kg) values (uid, ${q(w.day)}, ${w.weight_kg}) on conflict (user_id, day) do nothing;\n`;
}
for (const d of days) {
  sql += `  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, ${q(d.day)}, ${d.kcal}, ${d.protein}, ${d.carbs}, ${d.fat}, ${j(d.portions)}, ${d.active_kcal}, ${d.sleep_h}, ${d.energy}) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, ${q(d.day)}, ${d.water_ml}, ${d.steps}) on conflict (user_id, day) do nothing;\n`;
}
sql += 'end $$;\n';
writeFileSync(new URL('../supabase/seed/0005_progress_import.sql', import.meta.url), sql);
console.log(`OK: ${scans.length} InBody, ${weights.length} pesos, ${days.length} días`);
