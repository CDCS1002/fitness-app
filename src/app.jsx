import { useEffect, useState } from 'preact/hooks';
import { supabase } from './lib/supabase.js';
import { getGroups } from './lib/api.js';
import { DEFAULT_GROUPS } from './lib/portions.js';
import { Login } from './screens/Login.jsx';
import { Day } from './screens/Day.jsx';
import { Strength } from './screens/Strength.jsx';

const TABS = [
  { code: 'hoy', name: 'Hoy', icon: 'M4 5h16M4 12h16M4 19h10' },
  { code: 'fuerza', name: 'Fuerza', icon: 'M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12' },
];

function readTab() {
  try { return localStorage.getItem('tab') || 'hoy'; } catch { return 'hoy'; }
}

export function App() {
  const [session, setSession] = useState(undefined);
  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [tab, setTab] = useState(readTab);

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
      {tab === 'fuerza' ? <Strength /> : <Day groups={groups} onSignOut={() => supabase.auth.signOut()} />}
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
