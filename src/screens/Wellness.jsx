import { useEffect, useState } from 'preact/hooks';
import { getPlanFor, getDailyLog, activitiesFor, setDailyFields } from '../lib/api.js';
import { ActivityCard, StepsCard, SleepCard, EnergyCard } from '../components/DailyCards.jsx';
import { DayHeader } from '../components/DayHeader.jsx';

/** Pestaña Actividad: sueño, energía, sesiones del Apple Watch y pasos. */
export function Wellness({ date, setDate }) {
  const [plan, setPlan] = useState(null);
  const [log, setLog] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setError('');
    Promise.all([getPlanFor(date), getDailyLog(date), activitiesFor(date)])
      .then(([p, l, a]) => { if (alive) { setPlan(p); setLog(l); setActivities(a); } })
      .catch((err) => alive && setError(err.message));
    return () => { alive = false; };
  }, [date]);

  async function save(fields) {
    const row = await setDailyFields(date, fields);
    setLog(row);
  }

  return (
    <div class="app">
      <DayHeader date={date} setDate={setDate} title="Actividad" />
      <main class="content">
        {error && <p class="error">{error}</p>}
        <SleepCard date={date} plan={plan} sleep={log?.sleep_h != null ? Number(log.sleep_h) : null} log={log} onSave={save} />
        <EnergyCard energy={log?.energy ?? null} onSave={save} />
        <ActivityCard date={date} activities={activities} setActivities={setActivities} />
        <StepsCard date={date} plan={plan} steps={log?.steps ?? null}
          setStepsValue={(steps) => setLog((l) => ({ ...(l || {}), steps }))} />
      </main>
    </div>
  );
}
