-- =====================================================================
-- FITNESS APP · Registro de emociones
-- kind = 'momento' (cómo me siento ahora, con hora) o 'dia' (cómo me sentí hoy).
-- emotions: [{ "id": "preocupado", "intensity": 1..5 }] con los ids de src/lib/emotions.js
-- details:  campos opcionales de la nota { "situacion", "pensamiento", "cuerpo", "accion" }
-- =====================================================================
create table if not exists public.mood_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  kind       text not null default 'momento' check (kind in ('momento','dia')),
  at_time    time,
  emotions   jsonb not null check (jsonb_typeof(emotions) = 'array' and jsonb_array_length(emotions) between 1 and 10),
  areas      text[] not null default '{}',
  note       text,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mood_entries_user_day on public.mood_entries (user_id, day);

alter table public.mood_entries enable row level security;
revoke all on public.mood_entries from anon;
grant select, insert, update, delete on public.mood_entries to authenticated;
drop policy if exists mood_own on public.mood_entries;
create policy mood_own on public.mood_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop trigger if exists mood_touch on public.mood_entries;
create trigger mood_touch before update on public.mood_entries
  for each row execute function public.touch_updated_at();
