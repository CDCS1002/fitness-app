import { useEffect, useRef, useState } from 'preact/hooks';
import { searchFoods, recentFoods, getFood, addEntry, updateEntry, findByBarcode } from '../lib/api.js';
import { fetchOFF, mapOFF } from '../lib/off.js';
import { Scanner } from '../components/Scanner.jsx';
import { macrosFor, portionsFor, describePortions, subtypeFor } from '../lib/portions.js';
import { NewFood } from './NewFood.jsx';
import { MEALS } from '../lib/meals.js';

const n0 = (x) => Math.round(Number(x) || 0);
const n1 = (x) => Math.round((Number(x) || 0) * 10) / 10;

export function AddFood({ date, meal, groups, onClose, onAdded }) {
  const [step, setStep] = useState('search');
  const [food, setFood] = useState(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState(null); // { initial, source, notice } para NewFood
  const [lookup, setLookup] = useState('');

  async function onCode(code) {
    setStep('lookup');
    setLookup(code);
    try {
      const local = await findByBarcode(code);
      if (local) { setFood(local); setStep('detail'); return; }
      let product = null;
      try { product = await fetchOFF(code); } catch { product = null; }
      if (product) {
        const m = mapOFF(product);
        setDraft({
          initial: m,
          source: 'openfoodfacts',
          notice: {
            kind: m.complete ? 'ok' : 'warn',
            image: m.image,
            text: m.complete
              ? 'Encontrado en Open Food Facts. Revisa los valores contra la etiqueta y el grupo antes de guardar.'
              : 'Encontrado en Open Food Facts, pero le faltan datos nutricionales. Complétalos con la etiqueta.',
          },
        });
      } else {
        setDraft({
          initial: { barcode: code },
          source: 'etiqueta',
          notice: { kind: 'warn', text: `El código ${code} no está en Open Food Facts. Agrégalo con los datos de la etiqueta.` },
        });
      }
      setStep('new');
    } catch (err) {
      alert(err.message);
      setStep('search');
    }
  }

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
          <Search query={query} setQuery={setQuery} onPick={pick} onScan={() => setStep('scan')}
            onNew={() => { setDraft({ initial: { name: query } }); setStep('new'); }} onClose={onClose} />
        )}
        {step === 'scan' && <Scanner onCode={onCode} onCancel={() => setStep('search')} />}
        {step === 'lookup' && (
          <div class="sheet-body lookup">
            <div class="spinner" aria-hidden="true" />
            <p>Buscando {lookup}…</p>
          </div>
        )}
        {step === 'detail' && food && (
          <Detail food={food} date={date} meal={meal} groups={groups} onBack={() => setStep('search')} onAdded={onAdded} />
        )}
        {step === 'new' && (
          <NewFood
            {...(draft || {})}
            groups={groups}
            onBack={() => setStep('search')}
            onCreated={(f) => { setFood(f); setStep('detail'); }}
          />
        )}
      </div>
    </div>
  );
}

function Search({ query, setQuery, onPick, onNew, onScan, onClose }) {
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
        <button class="icon-btn scan-btn" aria-label="Escanear código de barras" onClick={onScan}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 9v6M11 9v6M14 9v6M17 9v6" />
          </svg>
        </button>
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

/**
 * Cantidad, medida y tiempo de comida de un alimento. Con `entry` edita un
 * registro existente en vez de crear uno nuevo.
 */
export function Detail({ food, date, meal: initialMeal, groups, onBack, onAdded, entry, onDelete }) {
  const def = food.measures.find((m) => m.is_default) || food.measures[0];
  const fromEntry = entry && (entry.measure_label === 'g' ? 'g' : food.measures.find((m) => m.label === entry.measure_label)?.id);
  const initialId = entry ? fromEntry || 'g' : def ? def.id : 'g';
  const [measureId, setMeasureId] = useState(initialId);
  const measure = food.measures.find((m) => m.id === measureId) || null;
  const [quantity, setQuantity] = useState(
    entry ? (fromEntry ? Number(entry.quantity) : n1(entry.grams)) : def ? 1 : 100,
  );
  const [meal, setMeal] = useState(initialMeal);
  const [busy, setBusy] = useState(false);

  function changeMeasure(id) {
    setMeasureId(id);
    setQuantity(id === 'g' ? 100 : 1);
  }

  // Productos de la lista sin etiqueta: se registran por unidad, no por gramos
  const byList = food.source === 'lista';
  const qty = Number(quantity) || 0;
  const grams = (measure ? Number(measure.grams) : 1) * qty;
  const m = macrosFor(food, grams);
  const portions = portionsFor(food, grams, groups);

  async function save() {
    if (!(qty > 0)) return;
    setBusy(true);
    try {
      const args = { food, date, meal, measure, quantity: qty, groups };
      onAdded(entry ? await updateEntry(entry.id, args) : await addEntry(args));
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  }

  const step = measure ? 0.25 : 5;

  return (
    <>
      <header class="sheet-head">
        <button class="link" onClick={onBack}>{entry ? 'Cerrar' : '‹ Buscar'}</button>
        {entry ? <b>Editar registro</b> : <span />}
      </header>
      <div class="sheet-body">
        <h2 class="food-title">{food.name}{food.state && <span class="muted"> ({food.state})</span>}</h2>
        <p class="muted">
          {[food.brand, [groups[food.primary_group]?.name, food.source !== 'lista' && subtypeFor(food)].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}
          {food.source === 'estimado' && !food.verified && <span class="tag">valores estimados</span>}
          {food.source === 'lista' && <span class="tag list">equivalencia de la lista</span>}
        </p>

        <div class="qty-row">
          <div class="stepper">
            <button aria-label="Menos" onClick={() => setQuantity(Math.max(step, n1(qty - step) || step))}>−</button>
            <input type="number" inputmode="decimal" min="0" step="any" value={quantity}
              onInput={(e) => setQuantity(e.currentTarget.value)} />
            <button aria-label="Más" onClick={() => setQuantity(n1(qty + step) || step)}>+</button>
          </div>
          <select value={measureId} onChange={(e) => changeMeasure(e.currentTarget.value)}>
            {food.measures.map((x) => <option value={x.id} key={x.id}>{byList ? x.label : `${x.label} (${n1(x.grams)} g)`}</option>)}
            {!byList && <option value="g">gramos</option>}
          </select>
        </div>

        <div class="portion-preview">
          <span class="muted">Equivale a</span>
          <b>{describePortions(portions, groups)}</b>
          {!byList && <span class="muted">{n0(grams)} g</span>}
          {byList && <span class="muted">kcal y macros aproximados a partir de la equivalencia</span>}
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
          {busy ? 'Guardando…' : entry ? 'Guardar cambios' : 'Agregar'}
        </button>
        {entry && <button class="link danger center" onClick={onDelete}>Eliminar registro</button>}
      </div>
    </>
  );
}
