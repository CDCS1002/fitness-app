-- Gasto total del día (kcal totales del reloj: reposo + todo el movimiento).
-- Las kcal "fuera del entreno" se calculan en la app: total − kcal activas de las actividades.
alter table public.daily_logs
  add column if not exists total_kcal numeric check (total_kcal >= 0 and total_kcal <= 10000);
