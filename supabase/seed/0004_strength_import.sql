-- Importa tu catálogo de ejercicios y tu historial de fuerza del Google Sheet.
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
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Sentadilla con barra', 'Pierna', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Peso muerto rumano', 'Pierna', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Prensa de piernas', 'Pierna', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Extensión de cuádriceps', 'Pierna', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Curl femoral', 'Pierna', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Hip thrust', 'Glúteo', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Pantorrilla de pie', 'Pantorrilla', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Press de banca con mancuerna', 'Pecho', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Press inclinado con mancuernas', 'Pecho', 'superior', 'reps', '{1,4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Aperturas en polea recta', 'Pecho', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Fondos en paralelas', 'Tríceps', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Extensión de tríceps en polea', 'Tríceps', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Press francés', 'Tríceps', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Jalón al pecho neutro', 'Espalda', 'superior', 'reps', '{1,2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Remo con barra', 'Espalda', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Remo con mancuerna unilateral', 'Espalda', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Remo en polea baja', 'Espalda', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Curl con barra', 'Bíceps', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Curl martillo', 'Bíceps', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Curl predicador con barra', 'Bíceps', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Press militar con mancuernas', 'Hombro anterior', 'superior', 'reps', '{1,4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Elevaciones laterales', 'Hombro lateral', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Face pull', 'Hombro posterior', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Pájaros con mancuernas', 'Hombro posterior', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Crunch en polea', 'Abdomen', 'core', 'reps', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Elevación de piernas colgado', 'Abdomen', 'core', 'reps', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Rueda abdominal', 'Abdomen', 'core', 'reps', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Pallof press', 'Abdomen', 'core', 'reps', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Remo cerrado con mancuernas', 'Espalda', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Press cerrado con barra Rumana', 'Tríceps', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Extension de triceps unilateral', 'Tríceps', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Jalón a la cara', 'Espalda', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Extension de tríceps sobre la cabeza', 'Tríceps', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Plancha', 'Abdomen', 'core', 'segundos', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Abducción de cadera en máquina', 'Pierna', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Aducción de cadera en máquina', 'Pierna', 'inferior', 'reps', '{3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Plancha lateral', 'Abdomen', 'core', 'segundos', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Hollow hold', 'Abdomen', 'core', 'segundos', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Hiperextensión de glúteo', 'Pierna', 'inferior', 'reps', '{1,2,3,4,5}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Press inclinado con polea', 'Pecho', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Curl predicador con mancuerna', 'Bíceps', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Curl hacia al frente con polea', 'Bíceps', 'superior', 'reps', '{2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Aperturas en polea inclinada', 'Pecho', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Apeturas en polea declinada', 'Pecho', 'superior', 'reps', '{4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Curl de bíceps con rotación', 'Bíceps', 'superior', 'reps', '{1,2}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Patada de burro con polea', 'Tríceps', 'superior', 'reps', '{1,4}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Sentadilla copa', 'Pierna', 'inferior', 'reps', '{1,3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Desplantes búlgaros', 'Pierna', 'inferior', 'reps', '{1,3}') on conflict (user_id, name) do nothing;
  insert into public.exercises (user_id, name, muscle, body, measure, days) values (uid, 'Hombro polea cruzada', 'Hombro posterior', 'superior', 'reps', '{1,2}') on conflict (user_id, name) do nothing;
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 20, '{12,12,10}', 6 from public.exercises e
    where e.user_id = uid and e.name = 'Remo cerrado con mancuernas'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 30, '{10,10,8}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Press cerrado con barra Rumana'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 27.5, '{12,12,10}', 5 from public.exercises e
    where e.user_id = uid and e.name = 'Remo con mancuerna unilateral'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 10, '{10,10,8}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Extension de triceps unilateral'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 25, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Jalón a la cara'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 25, '{10,10,10}', 5 from public.exercises e
    where e.user_id = uid and e.name = 'Extension de tríceps sobre la cabeza'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 0, '{60,60,60}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Plancha'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-13', e.id, 36.2, '{12,12,12}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Crunch en polea'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-13');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-14', e.id, 160, '{8,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Prensa de piernas'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-14');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-14', e.id, 50, '{10,8,8}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Pantorrilla de pie'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-14');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-14', e.id, 36, '{10,12,10}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Extensión de cuádriceps'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-14');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-14', e.id, 35, '{12,12,12}', 5 from public.exercises e
    where e.user_id = uid and e.name = 'Curl femoral'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-14');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-14', e.id, 65, '{12,12,12}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Abducción de cadera en máquina'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-14');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-14', e.id, 0, '{12,12,12}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Rueda abdominal'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-14');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-14', e.id, 10, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Hiperextensión de glúteo'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-14');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 32.5, '{7,7,6}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Press de banca con mancuerna'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 15, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Curl martillo'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 10, '{12,12,12}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Apeturas en polea declinada'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 7.5, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Curl hacia al frente con polea'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 10, '{10,10,10}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Press inclinado con polea'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 15, '{10,10,10}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Curl predicador con barra'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 10, '{8,8,8}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Elevaciones laterales'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 36.2, '{25,25,25}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Crunch en polea'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-15', e.id, 0, '{30,30,30}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Plancha lateral'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-15');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 27.5, '{7,7,6}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Press inclinado con mancuernas'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 11.3, '{8,8,8}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Curl de bíceps con rotación'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 65, '{8,8,8}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Jalón al pecho neutro'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 15, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Patada de burro con polea'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 30, '{8,8,8}', 6 from public.exercises e
    where e.user_id = uid and e.name = 'Sentadilla copa'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 0, '{8,8,8}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Desplantes búlgaros'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 15, '{10,10,10}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Hombro polea cruzada'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-19', e.id, 35, '{10,10,10}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Pallof press'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-19');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 22.5, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Remo cerrado con mancuernas'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 17.5, '{10,10,10}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Curl martillo'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 30, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Remo con mancuerna unilateral'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 20, '{8,8,10}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Curl hacia al frente con polea'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 35, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Jalón a la cara'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 15, '{6,6,6}', 10 from public.exercises e
    where e.user_id = uid and e.name = 'Curl predicador con mancuerna'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 12.5, '{12,12,12}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Elevaciones laterales'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 43, '{20,20,20}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Crunch en polea'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-20', e.id, 0, '{70,70,70}', 10 from public.exercises e
    where e.user_id = uid and e.name = 'Plancha'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-20');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 160, '{10,10,10}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Prensa de piernas'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 50, '{10,10,10}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Pantorrilla de pie'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 55, '{10,10,10}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Extensión de cuádriceps'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 45, '{9,9,9}', 9 from public.exercises e
    where e.user_id = uid and e.name = 'Curl femoral'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 70, '{10,10,10}', 8 from public.exercises e
    where e.user_id = uid and e.name = 'Abducción de cadera en máquina'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 72.5, '{15,15,15}', 7 from public.exercises e
    where e.user_id = uid and e.name = 'Aducción de cadera en máquina'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 10, '{10,10,10}', 10 from public.exercises e
    where e.user_id = uid and e.name = 'Hiperextensión de glúteo'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
  insert into public.strength_entries (user_id, day, exercise_id, weight_kg, sets, rpe)
    select uid, '2026-10-21', e.id, 0, '{10,10,10}', 10 from public.exercises e
    where e.user_id = uid and e.name = 'Rueda abdominal'
      and not exists (select 1 from public.strength_entries s where s.user_id = uid and s.exercise_id = e.id and s.day = '2026-10-21');
end $$;
