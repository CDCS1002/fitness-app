import { useEffect, useState } from 'preact/hooks';
import { entriesFor, getPlanFor, deleteEntry } from '../lib/api.js';
import { sumRoundedPortions, describePortions } from '../lib/portions.js';
import { addDays, labelFor, today } from '../lib/dates.js';
import { PortionBoard } from '../components/PortionBoard.jsx';
import { AddFood } from './AddFood.jsx';
import { MEALS } from '../lib/meals.js';

const n0 = (x) => Math.round(Number(x) || 0);

export function Day({ groups, onSignOut }) {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(null); // código de comida

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [e, p] = await Promise.all([entriesFor(date), getPlanFor(date)]);
      setEntries(e);
      setPlan(p);
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

        <PortionBoard totals={totals} targets={plan?.targets} groups={groups} />

        <section class="macros">
          <div><b>{n0(sum('kcal'))}</b><span>kcal</span></div>
          <div><b>{n0(sum('protein'))}</b><span>proteína</span></div>
          <div><b>{n0(sum('carbs'))}</b><span>carbos</span></div>
          <div><b>{n0(sum('fat'))}</b><span>grasa</span></div>
        </section>

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
                <button class="entry" key={e.id} onClick={() => remove(e)} title="Tocar para eliminar">
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

        <footer class="foot">
          {plan && <span class="muted">{plan.name} · desde {plan.start_date}</span>}
          <button class="link" onClick={onSignOut}>Cerrar sesión</button>
        </footer>
      </main>

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
