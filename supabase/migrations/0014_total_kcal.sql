-- Kcal activas de todo el día que marca el reloj (anillo Moverse: entrenamientos + el resto
-- del movimiento, SIN el reposo). La app calcula:
--   fuera del entreno = activas del día − kcal de las actividades
--   gasto total       = tasa metabólica basal del InBody vigente + activas del día
-- Es seguro correrla aunque ya se haya corrido la versión anterior (columna total_kcal).
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'daily_logs' and column_name = 'total_kcal')
     and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'daily_logs' and column_name = 'day_active_kcal') then
    alter table public.daily_logs rename column total_kcal to day_active_kcal;
  end if;
end $$;

alter table public.daily_logs
  add column if not exists day_active_kcal numeric check (day_active_kcal >= 0 and day_active_kcal <= 10000);

-- Historial de la columna "Kcal totales" del Google Sheet (13–21 de octubre).
do $$
declare uid uuid;
begin
  if (select count(*) from auth.users) <> 1 then
    raise notice 'No se importó el historial: se esperaba exactamente 1 usuario';
    return;
  end if;
  select id into uid from auth.users limit 1;
  insert into public.daily_logs (user_id, day, day_active_kcal)
  values (uid, '2026-10-13', 867), (uid, '2026-10-14', 925), (uid, '2026-10-15', 1491),
         (uid, '2026-10-16', 997), (uid, '2026-10-17', 151), (uid, '2026-10-18', 96),
         (uid, '2026-10-19', 1100), (uid, '2026-10-20', 925), (uid, '2026-10-21', 1015)
  on conflict (user_id, day) do update
    set day_active_kcal = coalesce(public.daily_logs.day_active_kcal, excluded.day_active_kcal);
end $$;
