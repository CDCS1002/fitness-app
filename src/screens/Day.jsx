import { useEffect, useState } from 'preact/hooks';
import { entriesFor, getPlanFor, deleteEntry, getFood, getDailyLog, listInbody } from '../lib/api.js';
import { WaterCard } from '../components/DailyCards.jsx';
import { MedsCard } from '../components/MedsCard.jsx';
import { DayHeader } from '../components/DayHeader.jsx';
import { sumRoundedPortions, describePortions } from '../lib/portions.js';
import { PortionBoard } from '../components/PortionBoard.jsx';
import { KcalMeter } from '../components/KcalMeter.jsx';
import { dayEnergy, balanceLabel, bmrFor } from '../lib/energy.js';
import { AddFood, Detail } from './AddFood.jsx';
import { NewFood } from './NewFood.jsx';
import { MEALS, EXTRA_SECTIONS } from '../lib/meals.js';

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
  const [dayActive, setDayActive] = useState(null);
  const [scans, setScans] = useState([]);
  useEffect(() => { listInbody().then(setScans).catch(() => {}); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [e, p, log] = await Promise.all([entriesFor(date), getPlanFor(date), getDailyLog(date)]);
      setEntries(e);
      setPlan(p);
      setWaterMl(Number(log?.water_ml || 0));
      setDayActive(log?.day_active_kcal != null ? Number(log.day_active_kcal) : null);
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
      <DayHeader date={date} setDate={setDate} title="Alimentación">
        <nav class="jump" aria-label="Ir a una sección">
          {[...MEALS, ...EXTRA_SECTIONS].map((s) => {
            const n = entries.filter((e) => e.meal === s.code).length;
            return (
              <a key={s.code} href={`#sec-${s.code}`} style={`--c:${s.color}`} class={n ? 'has' : ''}
                onClick={(ev) => { ev.preventDefault(); document.getElementById(`sec-${s.code}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span aria-hidden="true">{s.icon}</span>{s.short}{n > 0 && <i>{n}</i>}
              </a>
            );
          })}
        </nav>
      </DayHeader>

      <main class="content">
        {error && <p class="error">{error}</p>}

        <KcalMeter
          eaten={sum('kcal')}
          macros={{ protein: sum('protein'), carbs: sum('carbs'), fat: sum('fat') }}
          plan={plan}
          onPlanChange={setPlan}
        />
        {dayActive != null && bmrFor(scans, date) != null && <BalanceLine eaten={sum('kcal')} dayActive={dayActive} bmr={bmrFor(scans, date)} />}

        <PortionBoard totals={totals} targets={plan?.targets} groups={groups} />

        {MEALS.map((meal) => {
          const list = entries.filter((e) => e.meal === meal.code);
          const kcal = list.reduce((a, e) => a + Number(e.kcal), 0);
          return (
            <section class={`meal meal-card ${list.length ? '' : 'empty-meal'}`} key={meal.code} id={`sec-${meal.code}`} style={`--c:${meal.color}`}>
              <header>
                <span class="meal-ic" aria-hidden="true">{meal.icon}</span>
                <h2>{meal.name}</h2>
                <span class="muted">{list.length ? `${n0(kcal)} kcal · ${describePortions(sumRoundedPortions(list), groups)}` : loading ? '' : 'Sin registros'}</span>
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
            </section>
          );
        })}

        <div id="sec-meds" class="sec-anchor"><MedsCard date={date} /></div>
        <div id="sec-agua" class="sec-anchor"><WaterCard date={date} plan={plan} waterMl={waterMl} setWaterMl={setWaterMl} /></div>
      </main>

      {editing && (
        <div class="sheet-backdrop" onClick={(ev) => ev.target === ev.currentTarget && setEditing(null)}>
          <div class="sheet" role="dialog" aria-modal="true">
            {editing.mode === 'food' ? (
              <NewFood food={editing.food} groups={groups} onBack={() => setEditing({ ...editing, mode: null })}
                onSaved={async () => { await load(); setEditing(null); }} />
            ) : (
            <Detail
              onEditFood={() => setEditing({ ...editing, mode: 'food' })}
              food={editing.food}
              entry={editing.entry}
              date={date}
              meal={editing.entry.meal}
              groups={groups}
              onBack={() => setEditing(null)}
              onDelete={() => remove(editing.entry)}
              onAdded={(row) => { setEntries((l) => l.map((x) => (x.id === row.id ? row : x))); setEditing(null); }}
            />
            )}
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
          onFoodEdited={load}
        />
      )}
    </div>
  );
}

/** Comido vs gastado (basal del InBody + kcal activas del día registradas en Actividad). */
function BalanceLine({ eaten, dayActive, bmr }) {
  const e = dayEnergy({ dayActive, bmr, eaten });
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
