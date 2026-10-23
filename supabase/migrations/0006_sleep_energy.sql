-- =====================================================================
-- FITNESS APP · Sueño y energía del día
-- =====================================================================
alter table public.daily_logs
  add column if not exists sleep_h numeric check (sleep_h >= 0 and sleep_h <= 24),
  add column if not exists energy  smallint check (energy between 1 and 5);

-- Meta de sueño (hoja Configuración: 8 h)
alter table public.plans
  add column if not exists sleep_target numeric default 8;
update public.plans set sleep_target = coalesce(sleep_target, 8);

-- Pasa el sueño y la energía importados del Sheet al registro diario
update public.daily_logs d
   set sleep_h = coalesce(d.sleep_h, l.sleep_h),
       energy  = coalesce(d.energy, l.energy::smallint)
  from public.legacy_days l
 where l.user_id = d.user_id and l.day = d.day;
