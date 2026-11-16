-- =====================================================================
-- Alta de Nico: plan nutricional, InBody, rutina y ejercicios nuevos.
--
-- ANTES de correrlo:
--   1. Corre la migración 0003_inbody_refs.sql (una sola vez).
--   2. Crea su usuario en Supabase → Authentication → Users → Add user
--      (correo y contraseña, con "Auto Confirm User" marcado).
--   3. Escribe su correo en la línea v_email de abajo.
-- Se puede correr más de una vez: no duplica nada.
-- =====================================================================
do $$
declare
  v_email text := 'CORREO_DE_NICO@ejemplo.com';   -- << su correo de inicio de sesión
  v_uid   uuid;
  d1 int[] := '{1,5}';   -- Día 1 (pierna y glúteo): lunes y viernes
  d2 int[] := '{3,5}';   -- Día 2 (espalda y hombro): miércoles y viernes
  ex record;
begin
  select id into v_uid from auth.users where lower(email) = lower(v_email);
  if v_uid is null then
    raise exception 'No existe un usuario con el correo %. Créalo primero en Authentication.', v_email;
  end if;

  -- ---------------- Ejercicios nuevos en el catálogo compartido ----------------
  insert into public.exercises (name, muscle, body, measure, created_by) values
    ('Desplantes en Smith',                               'Pierna',                    'inferior', 'reps',     v_uid),
    ('Sentadilla con press militar (mancuernas)',         'Pierna y hombro',           'inferior', 'reps',     v_uid),
    ('Abducción de cadera de pie con minibanda',          'Glúteo',                    'inferior', 'reps',     v_uid),
    ('Bicycle crunch',                                    'Abdomen',                   'core',     'segundos', v_uid),
    ('Jalón al pecho abierto',                            'Espalda',                   'superior', 'reps',     v_uid),
    ('Curl + press de hombro + tríceps copa (mancuerna)', 'Bíceps, hombro y tríceps',  'superior', 'reps',     v_uid)
  on conflict do nothing;

  -- ---------------- Su rutina: ejercicio → días ----------------
  for ex in
    select * from (values
      -- Día 1
      ('Desplantes en Smith', d1),
      ('Sentadilla con press militar (mancuernas)', d1),
      ('Curl femoral', d1),                                  -- "Flexión de rodilla máquina"
      ('Aducción de cadera en máquina', d1),
      ('Abducción de cadera de pie con minibanda', d1),
      ('Bicycle crunch', d1),
      -- Día 2
      ('Jalón al pecho abierto', d2),
      ('Hombro polea cruzada', d2),                          -- también "Hombro mariposa"
      ('Curl + press de hombro + tríceps copa (mancuerna)', d2),
      ('Face pull', d2),                                     -- "Pull face con mecate polea"
      ('Rueda abdominal', d2)                                -- "Roll out rodillo"
    ) as t(name, days)
  loop
    insert into public.exercise_prefs (user_id, exercise_id, days, archived)
    select v_uid, e.id, ex.days, false
      from public.exercises e where public.norm(e.name) = public.norm(ex.name)
    on conflict (user_id, exercise_id) do update set days = excluded.days, archived = false;
    if not found then
      raise exception 'No encontré el ejercicio "%" en el catálogo', ex.name;
    end if;
  end loop;

  -- ---------------- Semana ----------------
  insert into public.routines (user_id, weekday, name, full_name, is_rest) values
    (v_uid, 1, 'Pierna · Glúteo',   'Día 1: pierna, glúteo y abdomen', false),
    (v_uid, 2, 'Descanso',          'Descanso', true),
    (v_uid, 3, 'Espalda · Hombro',  'Día 2: espalda, hombro y abdomen', false),
    (v_uid, 4, 'Descanso',          'Descanso', true),
    (v_uid, 5, 'Día 1 o Día 2',     'Pierna y glúteo o espalda y hombro (alternar)', false),
    (v_uid, 6, 'Descanso',          'Descanso', true),
    (v_uid, 7, 'Descanso',          'Descanso', true)
  on conflict (user_id, weekday) do update
    set name = excluded.name, full_name = excluded.full_name, is_rest = excluded.is_rest;

  -- Progresión: 10–12 repeticiones, 35–45 s en los de tiempo
  insert into public.strength_settings (user_id, reps_min, reps_max, secs_min, secs_max, step_inferior, step_superior, step_core, step_isometrico)
  values (v_uid, 10, 12, 35, 45, 5, 2.5, 2.5, 2.5)
  on conflict (user_id) do update set reps_min = 10, reps_max = 12, secs_min = 35, secs_max = 45;

  -- ---------------- Plan nutricional (consulta del 10/11/2026) ----------------
  if not exists (select 1 from public.plans where user_id = v_uid and start_date = date '2026-11-10') then
    insert into public.plans (user_id, name, start_date, targets, water_train_ml, water_rest_ml, steps_target,
                              training_days, sleep_target, visit_notes)
    values (v_uid, 'Plan noviembre 2026', date '2026-11-10',
            '{"lacteo":1,"vegetal":2,"fruta":2,"carbohidrato":5,"proteina":10,"grasa":2,"azucar":1}'::jsonb,
            3000, 2500, 10000, '{1,3,5}', 8,
            'Objetivo: déficit calórico. Carnes: 8 magras y 2 semigrasas. Azúcar: máx. 1 cucharada. '
            || 'Cada tiempo de comida con mínimo 30 g de proteína. Días con ayuno: romperlo con proteína; '
            || 'durante el ayuno solo agua y tés sin azúcar.');
  end if;

  -- ---------------- Medición de la nutricionista (10/11/2026) ----------------
  insert into public.body_weights (user_id, day, weight_kg, fat_pct, muscle_kg, source)
  values (v_uid, date '2026-11-10', 63.3, 37, 37.9, 'nutricionista')
  on conflict (user_id, day) do nothing;

  -- ---------------- InBody 270 del 06/07/2026 ----------------
  insert into public.inbody_scans (user_id, day, metrics, refs, notes) values
  (v_uid, date '2026-07-06',
   '{"weight":63.9,"smm":20.7,"fat_mass":25.9,"pbf":40.5,"tbw":27.8,"protein":7.5,"minerals":2.65,"ffm":38.0,
     "bmi":26.3,"visceral":13,"whr":0.94,"obesity_degree":125,"score":65,"bmr":1192,"kcal_rec":1627,"smi":6.1,
     "target_weight":51.1,"fat_control":-14.1,"muscle_control":1.3,
     "lean_arm_l":1.87,"lean_arm_l_pct":92.9,"lean_arm_r":1.94,"lean_arm_r_pct":96.3,"lean_trunk":17.8,"lean_trunk_pct":98.1,
     "lean_leg_l":5.42,"lean_leg_l_pct":85.4,"lean_leg_r":5.58,"lean_leg_r_pct":87.9,
     "fat_arm_l":2.0,"fat_arm_l_pct":228.3,"fat_arm_r":1.9,"fat_arm_r_pct":223.7,"fat_trunk":13.3,"fat_trunk_pct":277.6,
     "fat_leg_l":3.7,"fat_leg_l_pct":170.2,"fat_leg_r":3.7,"fat_leg_r_pct":171.4}'::jsonb,
   '{"weight":"43,4 a 58,8","fat_mass":"10,2 a 16,4","pbf":"18 a 28","tbw":"26,0 a 31,8","protein":"7,0 a 8,6",
     "minerals":"2,41 a 2,95","ffm":"35,4 a 43,3","bmi":"18,5 a 25,0","visceral":"menor a 10","whr":"0,75 a 0,85",
     "obesity_degree":"90 a 110","bmr":"1327 a 1539"}'::jsonb,
   'InBody 270'),
  -- Historial que trae el mismo reporte (peso, masa musculoesquelética y % de grasa)
  (v_uid, date '2025-02-26', '{"weight":55.6,"smm":19.4,"pbf":35.2}'::jsonb, null, 'Del historial del InBody'),
  (v_uid, date '2025-07-07', '{"weight":61.9,"smm":20.4,"pbf":38.9}'::jsonb, null, 'Del historial del InBody'),
  (v_uid, date '2025-10-10', '{"weight":62.9,"smm":20.7,"pbf":39.4}'::jsonb, null, 'Del historial del InBody'),
  (v_uid, date '2026-02-09', '{"weight":65.1,"smm":21.4,"pbf":39.3}'::jsonb, null, 'Del historial del InBody'),
  (v_uid, date '2026-05-19', '{"weight":64.9,"smm":21.0,"pbf":40.5}'::jsonb, null, 'Del historial del InBody')
  on conflict (user_id, day) do nothing;

  raise notice 'Listo: Nico (%) cargada.', v_uid;
end $$;

-- Revisión rápida
select r.weekday, r.name,
       (select string_agg(e.name, ', ' order by e.name) from public.exercise_prefs p join public.exercises e on e.id = p.exercise_id
         where p.user_id = r.user_id and r.weekday = any(p.days)) as ejercicios
  from public.routines r
 where r.user_id = (select id from auth.users where lower(email) = lower('CORREO_DE_NICO@ejemplo.com'))
 order by r.weekday;
