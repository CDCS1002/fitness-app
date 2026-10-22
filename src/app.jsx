import { useEffect, useState } from 'preact/hooks';
import { supabase } from './lib/supabase.js';
import { getGroups } from './lib/api.js';
import { DEFAULT_GROUPS } from './lib/portions.js';
import { Login } from './screens/Login.jsx';
import { Day } from './screens/Day.jsx';

export function App() {
  const [session, setSession] = useState(undefined);
  const [groups, setGroups] = useState(DEFAULT_GROUPS);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) getGroups().then(setGroups).catch(() => {});
  }, [session?.user?.id]);

  if (session === undefined) return <div class="splash" />;
  if (!session) return <Login />;
  return <Day groups={groups} onSignOut={() => supabase.auth.signOut()} />;
}
