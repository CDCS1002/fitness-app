import { useEffect, useState } from 'preact/hooks';
import { supabase } from './lib/supabase.js';
import { getGroups } from './lib/api.js';
import { DEFAULT_GROUPS } from './lib/portions.js';
import { Login } from './screens/Login.jsx';
import { Day } from './screens/Day.jsx';
import { Strength } from './screens/Strength.jsx';
import { Progress } from './screens/Progress.jsx';
import { Wellness } from './screens/Wellness.jsx';
import { Emotions } from './screens/Emotions.jsx';
import { today } from './lib/dates.js';

const TABS = [
  { code: 'alimentacion', name: 'Alimentación', icon: 'M7 3v8a3 3 0 0 0 3 3v7M7 3v5M10 3v5M17 3c-2 0-3 3-3 6s1 4 3 4v8' },
  { code: 'actividad', name: 'Actividad', icon: 'M3 12h4l3-8 4 16 3-8h4' },
  { code: 'fuerza', name: 'Fuerza', icon: 'M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12' },
  { code: 'emociones', name: 'Emociones', icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14.5s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01' },
  { code: 'progreso', name: 'Progreso', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
];

function readTab() {
  try {
    const t = localStorage.getItem('tab');
    return TABS.some((x) => x.code === t) ? t : 'alimentacion';
  } catch { return 'alimentacion'; }
}

export function App() {
  const [session, setSession] = useState(undefined);
  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [tab, setTab] = useState(readTab);
  const [date, setDate] = useState(today()); // compartida entre pestañas

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) getGroups().then(setGroups).catch(() => {});
  }, [session?.user?.id]);

  function go(code) {
    setTab(code);
    try { localStorage.setItem('tab', code); } catch { /* sin almacenamiento: no pasa nada */ }
    window.scrollTo(0, 0);
  }

  if (session === undefined) return <div class="splash" />;
  if (!session) return <Login />;
  return (
    <>
      {tab === 'actividad' ? <Wellness date={date} setDate={setDate} />
        : tab === 'fuerza' ? <Strength date={date} setDate={setDate} />
        : tab === 'progreso' ? <Progress onSignOut={() => supabase.auth.signOut()} />
        : tab === 'emociones' ? <Emotions date={date} setDate={setDate} />
        : <Day groups={groups} date={date} setDate={setDate} />}
      <nav class="tabbar" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.code} class={tab === t.code ? 'on' : ''} aria-current={tab === t.code ? 'page' : undefined} onClick={() => go(t.code)}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d={t.icon} /></svg>
            <span>{t.name}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
