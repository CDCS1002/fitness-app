import { useEffect, useState } from 'preact/hooks';
import { entriesFor, getPlanFor, deleteEntry, getFood, getDailyLog, activitiesFor } from '../lib/api.js';
import { ActivityCard, WaterCard, StepsCard } from '../components/DailyCards.jsx';
import { sumRoundedPortions, describePortions } from '../lib/portions.js';
import { addDays, labelFor, today } from '../lib/dates.js';
import { PortionBoard } from '../components/PortionBoard.jsx';
import { KcalMeter } from '../components/KcalMeter.jsx';
import { AddFood, Detail } from './AddFood.jsx';
import { MEALS } from '../lib/meals.js';

const n0 = (x) => Math.round(Number(x) || 0);

export function Day({ groups, onSignOut }) {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(null); // código de comida
  const [editing, setEditing] = useState(null); // { entry, food }
  const [activities, setActivities] = useState([]);
  const [waterMl, setWaterMl] = useState(0);
  const [steps, setStepsValue] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [e, p, log, acts] = await Promise.all([
        entriesFor(date), getPlanFor(date), getDailyLog(date), activitiesFor(date),
      ]);
      setEntries(e);
      setPlan(p);
      setWaterMl(Number(log?.water_ml || 0));
      setStepsValue(log?.steps ?? null);
      setActivities(acts);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [date]);

  async function remove(entry) {
    if (!confirm(`¿Eliminar ${entry.food_name}?`)) return;
    try {
      await deleteEntry(entry.id);
      setEntries((list) => list.filter((x) => x.id !== entry.id));
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function edit(entry) {
    if (!entry.food_id) {
      // El alimento ya no existe en la base: solo se puede eliminar el registro
      remove(entry);
      return;
    }
    try {
      setEditing({ entry, food: await getFood(entry.food_id) });
    } catch (err) {
      alert(err.message);
    }
  }

  const totals = sumRoundedPortions(entries);
  const sum = (k) => entries.reduce((a, e) => a + Number(e[k] || 0), 0);

  return (
    <div class="app">
      <header class="topbar">
        <button class="icon-btn" aria-label="Día anterior" onClick={() => setDate(addDays(date, -1))}>‹</button>
        <button class="day-title" onClick={() => setDate(today())}>
          <span>{labelFor(date)}</span>
          {date !== today() && <small class="muted">volver a hoy</small>}
        </button>
        <button class="icon-btn" aria-label="Día siguiente" onClick={() => setDate(addDays(date, 1))}>›</button>
      </header>

      <main class="content">
        {error && <p class="error">{error}</p>}

        <KcalMeter
          eaten={sum('kcal')}
          macros={{ protein: sum('protein'), carbs: sum('carbs'), fat: sum('fat') }}
          plan={plan}
          onPlanChange={setPlan}
        />

        <PortionBoard totals={totals} targets={plan?.targets} groups={groups} />

        {MEALS.map((meal) => {
          const list = entries.filter((e) => e.meal === meal.code);
          const kcal = list.reduce((a, e) => a + Number(e.kcal), 0);
          return (
            <section class="meal" key={meal.code}>
              <header>
                <h2>{meal.name}</h2>
                {list.length > 0 && <span class="muted">{n0(kcal)} kcal · {describePortions(sumRoundedPortions(list), groups)}</span>}
                <button class="add-btn" aria-label={`Agregar a ${meal.name}`} onClick={() => setAdding(meal.code)}>+</button>
              </header>
              {list.map((e) => (
                <button class="entry" key={e.id} onClick={() => edit(e)} title="Tocar para editar">
                  <span class="entry-main">
                    <span class="entry-name">{e.food_name}</span>
                    <span class="muted">{e.food_brand ? `${e.food_brand} · ` : ''}{describePortions(e.portions, groups)}</span>
                  </span>
                  <span class="entry-side">
                    <span>{e.measure_label === 'g' ? `${n0(e.grams)} g` : `${Number(e.quantity)} ${e.measure_label}`}</span>
                    <span class="muted">{n0(e.kcal)} kcal</span>
                  </span>
                </button>
              ))}
              {!loading && list.length === 0 && <p class="empty muted">Sin registros</p>}
            </section>
          );
        })}

        <ActivityCard date={date} activities={activities} setActivities={setActivities} />
        <WaterCard date={date} plan={plan} waterMl={waterMl} setWaterMl={setWaterMl} />
        <StepsCard date={date} plan={plan} steps={steps} setStepsValue={setStepsValue} />

        <footer class="foot">
          {plan && <span class="muted">{plan.name} · desde {plan.start_date}</span>}
          <button class="link" onClick={onSignOut}>Cerrar sesión</button>
        </footer>
      </main>

      {editing && (
        <div class="sheet-backdrop" onClick={(ev) => ev.target === ev.currentTarget && setEditing(null)}>
          <div class="sheet" role="dialog" aria-modal="true">
            <Detail
              food={editing.food}
              entry={editing.entry}
              date={date}
              meal={editing.entry.meal}
              groups={groups}
              onBack={() => setEditing(null)}
              onDelete={() => remove(editing.entry)}
              onAdded={(row) => { setEntries((l) => l.map((x) => (x.id === row.id ? row : x))); setEditing(null); }}
            />
          </div>
        </div>
      )}

      {adding && (
        <AddFood
          date={date}
          meal={adding}
          groups={groups}
          onClose={() => setAdding(null)}
          onAdded={(entry) => { setEntries((l) => [...l, entry]); setAdding(null); }}
        />
      )}
    </div>
  );
}
