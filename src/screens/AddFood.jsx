import { useEffect, useRef, useState } from 'preact/hooks';
import { searchFoods, recentFoods, getFood, addEntry } from '../lib/api.js';
import { macrosFor, portionsFor, describePortions } from '../lib/portions.js';
import { NewFood } from './NewFood.jsx';
import { MEALS } from '../lib/meals.js';

const n0 = (x) => Math.round(Number(x) || 0);
const n1 = (x) => Math.round((Number(x) || 0) * 10) / 10;

export function AddFood({ date, meal, groups, onClose, onAdded }) {
  const [step, setStep] = useState('search');
  const [food, setFood] = useState(null);
  const [query, setQuery] = useState('');

  async function pick(f) {
    try {
      setFood(await getFood(f.id));
      setStep('detail');
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true">
        {step === 'search' && (
          <Search query={query} setQuery={setQuery} onPick={pick} onNew={() => setStep('new')} onClose={onClose} />
        )}
        {step === 'detail' && food && (
          <Detail food={food} date={date} meal={meal} groups={groups} onBack={() => setStep('search')} onAdded={onAdded} />
        )}
        {step === 'new' && (
          <NewFood
            initialName={query}
            groups={groups}
            onBack={() => setStep('search')}
            onCreated={(f) => { setFood(f); setStep('detail'); }}
          />
        )}
      </div>
    </div>
  );
}

function Search({ query, setQuery, onPick, onNew, onClose }) {
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const seq = useRef(0);
  const input = useRef(null);

  useEffect(() => { input.current?.focus(); }, []);

  useEffect(() => {
    const id = ++seq.current;
    const t = setTimeout(async () => {
      setBusy(true);
      setError('');
      try {
        const data = query.trim() ? await searchFoods(query) : await recentFoods();
        if (id === seq.current) setResults(data);
      } catch (err) {
        if (id === seq.current) setError(err.message);
      }
      if (id === seq.current) setBusy(false);
    }, query.trim() ? 220 : 0);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      <header class="sheet-head">
        <input
          ref={input}
          class="search"
          type="search"
          placeholder="Buscar alimento o marca…"
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
        <button class="link" onClick={onClose}>Cerrar</button>
      </header>
      <div class="sheet-body">
        {!query.trim() && results.length > 0 && <p class="section-label">Recientes</p>}
        {error && <p class="error">{error}</p>}
        <ul class="results">
          {results.map((f) => (
            <li key={f.id}>
              <button class="result" onClick={() => onPick(f)}>
                <span class="dot" style={`background:var(--g-${f.primary_group})`} />
                <span class="entry-main">
                  <span class="entry-name">{f.name}{f.state ? <span class="muted"> ({f.state})</span> : null}</span>
                  <span class="muted">{[f.brand, `${n0(f.kcal)} kcal / 100 g`].filter(Boolean).join(' · ')}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {!busy && query.trim() && results.length === 0 && <p class="muted empty">No encontré “{query}”.</p>}
        <button class="btn ghost wide" onClick={onNew}>+ Crear alimento nuevo</button>
      </div>
    </>
  );
}

function Detail({ food, date, meal: initialMeal, groups, onBack, onAdded }) {
  const def = food.measures.find((m) => m.is_default) || food.measures[0];
  const [measureId, setMeasureId] = useState(def ? def.id : 'g');
  const measure = food.measures.find((m) => m.id === measureId) || null;
  const [quantity, setQuantity] = useState(def ? 1 : 100);
  const [meal, setMeal] = useState(initialMeal);
  const [busy, setBusy] = useState(false);

  function changeMeasure(id) {
    setMeasureId(id);
    setQuantity(id === 'g' ? 100 : 1);
  }

  const qty = Number(quantity) || 0;
  const grams = (measure ? Number(measure.grams) : 1) * qty;
  const m = macrosFor(food, grams);
  const portions = portionsFor(food, grams, groups);

  async function save() {
    if (!(qty > 0)) return;
    setBusy(true);
    try {
      onAdded(await addEntry({ food, date, meal, measure, quantity: qty, groups }));
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  }

  const step = measure ? 0.25 : 5;

  return (
    <>
      <header class="sheet-head">
        <button class="link" onClick={onBack}>‹ Buscar</button>
        <span />
      </header>
      <div class="sheet-body">
        <h2 class="food-title">{food.name}{food.state && <span class="muted"> ({food.state})</span>}</h2>
        <p class="muted">
          {[food.brand, groups[food.primary_group]?.name].filter(Boolean).join(' · ')}
          {food.source === 'estimado' && !food.verified && <span class="tag">valores estimados</span>}
        </p>

        <div class="qty-row">
          <div class="stepper">
            <button aria-label="Menos" onClick={() => setQuantity(Math.max(step, n1(qty - step) || step))}>−</button>
            <input type="number" inputmode="decimal" min="0" step="any" value={quantity}
              onInput={(e) => setQuantity(e.currentTarget.value)} />
            <button aria-label="Más" onClick={() => setQuantity(n1(qty + step) || step)}>+</button>
          </div>
          <select value={measureId} onChange={(e) => changeMeasure(e.currentTarget.value)}>
            {food.measures.map((x) => <option value={x.id} key={x.id}>{x.label} ({n1(x.grams)} g)</option>)}
            <option value="g">gramos</option>
          </select>
        </div>

        <div class="portion-preview">
          <span class="muted">Equivale a</span>
          <b>{describePortions(portions, groups)}</b>
          <span class="muted">{n0(grams)} g</span>
        </div>

        <section class="macros small">
          <div><b>{n0(m.kcal)}</b><span>kcal</span></div>
          <div><b>{n1(m.protein)}</b><span>proteína</span></div>
          <div><b>{n1(m.carbs)}</b><span>carbos</span></div>
          <div><b>{n1(m.fat)}</b><span>grasa</span></div>
        </section>

        <div class="meal-pick" role="radiogroup" aria-label="Tiempo de comida">
          {MEALS.map((x) => (
            <button key={x.code} role="radio" aria-checked={meal === x.code}
              class={meal === x.code ? 'on' : ''} onClick={() => setMeal(x.code)}>{x.name}</button>
          ))}
        </div>

        <button class="btn primary wide" disabled={busy || !(qty > 0)} onClick={save}>
          {busy ? 'Guardando…' : 'Agregar'}
        </button>
      </div>
    </>
  );
}
