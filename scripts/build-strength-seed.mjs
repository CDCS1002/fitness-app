// Genera supabase/seed/0004_strength_import.sql desde exercises.json y strength_history.json
// (catálogo y registros de la hoja Fuerza del Google Sheet). Idempotente.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(new URL(`../supabase/seed/${f}`, import.meta.url), 'utf8'));
const exercises = read('exercises.json');
const history = read('strength_history.json');
const q = (v) => (v == null ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `'{${a.join(',')}}'`;

let sql = `-- Importa tu catálogo de ejercicios y tu historial de fuerza del Google Sheet.
-- Generado por scripts/build-strength-seed.mjs. Ejecutar después de 0004_strength.sql.
-- Asigna los datos al único usuario de la app (si hay más de uno, se detiene).
do $$
declare
  uid uuid;
begin
  if (select count(*) from auth.users) <> 1 then
    raise exception 'Se esperaba exactamente 1 usuario en auth.users; ajusta el script';
  end if;
  select id into uid from auth.users limit 1;
`;
for (const e of exercises) {
  sql += `  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, ${q(e.name)}, ${q(e.muscle)}, ${q(e.body)}, ${q(e.measure)}, ${arr(e.days)}) on conflict (user_id, name) do nothing;\n`;
}
for (const h of history) {
  sql += `  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, ${q(h.day)}, e.id, ${h.weight}, ${arr(h.sets)}, ${q(h.rpe)} from public.exercises e
    where e.user_id = uid and e.name = ${q(h.exercise)}
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = ${q(h.day)});\n`;
}
sql += 'end $$;\n';
writeFileSync(new URL('../supabase/seed/0004_strength_import.sql', import.meta.url), sql);
console.log(`OK: ${exercises.length} ejercicios, ${history.length} registros`);
