import { useEffect, useState } from 'preact/hooks';
import { entriesFor, getPlanFor, deleteEntry, getFood, getDailyLog } from '../lib/api.js';
import { WaterCard } from '../components/DailyCards.jsx';
import { MedsCard } from '../components/MedsCard.jsx';
import { DayHeader } from '../components/DayHeader.jsx';
import { sumRoundedPortions, describePortions } from '../lib/portions.js';
import { PortionBoard } from '../components/PortionBoard.jsx';
import { KcalMeter } from '../components/KcalMeter.jsx';
import { dayEnergy, balanceLabel } from '../lib/energy.js';
import { AddFood, Detail } from './AddFood.jsx';
import { MEALS } from '../lib/meals.js';

const n0 = (x) => Math.round(Number(x) || 0);

/** Pestaña Alimentación: kcal, porciones, comidas y agua. */
export function Day({ groups, date, setDate }) {
  const [entries, setEntries] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(null); // código de comida
  const [editing, setEditing] = useState(null); // { entry, food }
  const [waterMl, setWaterMl] = useState(0);
  const [totalKcal, setTotalKcal] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [e, p, log] = await Promise.all([entriesFor(date), getPlanFor(date), getDailyLog(date)]);
      setEntries(e);
      setPlan(p);
      setWaterMl(Number(log?.water_ml || 0));
      setTotalKcal(log?.total_kcal != null ? Number(log.total_kcal) : null);
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
      <DayHeader date={date} setDate={setDate} title="Alimentación" />

      <main class="content">
        {error && <p class="error">{error}</p>}

        <KcalMeter
          eaten={sum('kcal')}
          macros={{ protein: sum('protein'), carbs: sum('carbs'), fat: sum('fat') }}
          plan={plan}
          onPlanChange={setPlan}
        />
        {totalKcal != null && <BalanceLine eaten={sum('kcal')} total={totalKcal} />}

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

        <WaterCard date={date} plan={plan} waterMl={waterMl} setWaterMl={setWaterMl} />
        <MedsCard date={date} />
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

/** Comido vs gastado (con el total del reloj registrado en Actividad). */
function BalanceLine({ eaten, total }) {
  const e = dayEnergy({ total, eaten });
  const fmt = (n) => new Intl.NumberFormat('es', { useGrouping: 'always' }).format(Math.abs(n));
  return (
    <p class="balance-line">
      <span>Comido <b>{fmt(Math.round(eaten))}</b></span>
      <span>Gastado <b>{fmt(e.total)}</b></span>
      <span class={e.balance < -100 ? 'up' : e.balance > 100 ? 'down' : ''}>
        <b>{e.balance > 0 ? '+' : e.balance < 0 ? '−' : ''}{fmt(e.balance)}</b> {balanceLabel(e.balance)}
      </span>
    </p>
  );
}
