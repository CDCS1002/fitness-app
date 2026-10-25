import { useState } from 'preact/hooks';
import { createFood, updateFood } from '../lib/api.js';
import { GROUP_ORDER, portionsFor, describePortions } from '../lib/portions.js';

/**
 * Alta de un alimento. Acepta los valores tal como vienen en la etiqueta
 * ("por porción de 30 g") o por 100 g, y puede venir prellenado desde
 * Open Food Facts (`initial` + `source`).
 * Con `food` corrige un alimento propio: datos, medidas y sus registros (`onSaved`).
 */
const r1 = (n) => Math.round(n * 10) / 10;

function fromFood(food) {
  const def = food.measures.find((m) => m.is_default) || food.measures[0];
  const k = def ? Number(def.grams) / 100 : 1;
  const v = (x) => (x == null ? '' : String(r1(Number(x) * k)));
  return {
    name: food.name, brand: food.brand || '', barcode: food.barcode || '', state: food.state || '', category: food.category || '',
    primary_group: food.primary_group, protein_source: !!food.protein_source,
    basis: def ? 'porcion' : '100',
    kcal: food.kcal == null ? '' : String(Math.round(Number(food.kcal) * k)), protein: v(food.protein), carbs: v(food.carbs), fat: v(food.fat), fiber: v(food.fiber),
  };
}

export function NewFood({ initial = {}, source = 'etiqueta', notice, groups, onBack, onCreated, food: editing, onSaved }) {
  const [measures, setMeasures] = useState(() => (editing
    ? editing.measures.map((m) => ({ id: m.id, label: m.label, grams: String(Number(m.grams)), is_default: m.is_default }))
    : []));
  const [touched, setTouched] = useState(false); // valores nutricionales modificados
  const [f, setF] = useState(editing ? { ...fromFood(editing), serving_label: '', serving_grams: '' } : {
    name: '', brand: '', barcode: '', state: '', category: '',
    primary_group: 'carbohidrato', protein_source: false,
    basis: 'porcion', serving_label: 'porción', serving_grams: '',
    kcal: '', protein: '', carbs: '', fat: '', fiber: '',
    ...Object.fromEntries(Object.entries(initial).filter(([, v]) => v != null)),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => {
    const t = e.currentTarget;
    if (['kcal', 'protein', 'carbs', 'fat', 'fiber'].includes(k)) setTouched(true);
    setF({ ...f, [k]: t.type === 'checkbox' ? t.checked : t.value });
  };

  const defMeasure = measures.find((m) => m.is_default) || measures[0];
  const servingG = editing ? Number(defMeasure?.grams) || 0 : Number(f.serving_grams);
  const factor = f.basis === '100' ? 1 : servingG > 0 ? 100 / servingG : 0;
  const num = (v) => (v === '' || v == null ? null : Number(v));
  const per100 = (v) => (num(v) == null ? null : Math.round(num(v) * factor * 100) / 100);
  // Al editar sin tocar los valores se conservan los originales por 100 g (sin redondeos)
  const keepValues = editing && !touched && f.basis === (fromFood(editing).basis);
  const food = keepValues
    ? { primary_group: f.primary_group, protein_source: f.protein_source, kcal: Number(editing.kcal), protein: Number(editing.protein), carbs: Number(editing.carbs), fat: Number(editing.fat) }
    : {
      primary_group: f.primary_group, protein_source: f.protein_source,
      kcal: per100(f.kcal) ?? 0, protein: per100(f.protein) ?? 0, carbs: per100(f.carbs) ?? 0, fat: per100(f.fat) ?? 0,
    };
  const servingLabel = editing ? defMeasure?.label : f.serving_label;
  const previewGrams = servingG > 0 ? servingG : 100;
  const previewLabel = servingG > 0 ? `1 ${servingLabel || 'porción'} (${servingG} g)` : '100 g';
  const measuresOk = !editing || measures.every((m) => m.label.trim() && Number(m.grams) > 0);
  const ready = f.name.trim() && factor > 0 && f.kcal !== '' && measuresOk;

  const setMeasure = (i, k) => (e) => {
    const val = k === 'is_default' ? true : e.currentTarget.value;
    setMeasures(measures.map((m, j) => (k === 'is_default' ? { ...m, is_default: j === i } : j === i ? { ...m, [k]: val } : m)));
  };

  async function saveEdit() {
    const fields = {
      name: f.name.trim(),
      brand: String(f.brand || '').trim() || null,
      barcode: String(f.barcode || '').trim() || null,
      state: f.state || null,
      category: String(f.category || '').trim() || null,
      primary_group: f.primary_group, protein_source: f.protein_source,
      ...(keepValues ? {} : { kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat, fiber: per100(f.fiber) }),
    };
    const ms = measures.map((m) => ({ ...(m.id ? { id: m.id } : {}), label: m.label.trim(), grams: Number(m.grams), is_default: !!m.is_default }));
    if (ms.length && !ms.some((m) => m.is_default)) ms[0].is_default = true;
    onSaved(await updateFood(editing, fields, ms, groups));
  }

  async function save(e) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError('');
    if (editing) {
      try { await saveEdit(); } catch (err) {
        setError(err.message.includes('foods_barcode_uniq') ? 'Ya existe un alimento con ese código de barras.'
          : err.message.includes('food_measures_food_id_label') ? 'Hay dos medidas con el mismo nombre.' : err.message);
        setBusy(false);
      }
      return;
    }
    try {
      const measures = servingG > 0
        ? [{ label: f.serving_label.trim() || 'porción', grams: servingG, is_default: true }]
        : [];
      const created = await createFood({
        name: f.name.trim(),
        brand: String(f.brand || '').trim() || null,
        barcode: String(f.barcode || '').trim() || null,
        state: f.state || null,
        category: String(f.category || '').trim() || null,
        ...food,
        fiber: per100(f.fiber),
        source,
        verified: true,
      }, measures);
      onCreated(created);
    } catch (err) {
      setError(err.message.includes('foods_barcode_uniq') ? 'Ya existe un alimento con ese código de barras.' : err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <header class="sheet-head">
        <button class="link" onClick={onBack}>{editing ? '‹ Volver' : '‹ Buscar'}</button>
        <b>{editing ? 'Editar alimento' : 'Nuevo alimento'}</b>
      </header>
      <form class="sheet-body form" onSubmit={save}>
        {notice && (
          <div class={`notice ${notice.kind || ''}`}>
            {notice.image && <img src={notice.image} alt="" />}
            <span>{notice.text}</span>
          </div>
        )}
        <label>Nombre<input required value={f.name} onInput={set('name')} /></label>
        <div class="grid2">
          <label>Marca<input value={f.brand} onInput={set('brand')} /></label>
          <label>Estado
            <select value={f.state} onChange={set('state')}>
              <option value="">—</option><option value="crudo">crudo</option><option value="cocido">cocido</option>
            </select>
          </label>
        </div>
        <div class="grid2">
          <label>Grupo principal
            <select value={f.primary_group} onChange={set('primary_group')}>
              {GROUP_ORDER.map((g) => <option value={g} key={g}>{groups[g]?.name || g}</option>)}
            </select>
          </label>
          <label>Código de barras<input inputmode="numeric" value={f.barcode} onInput={set('barcode')} /></label>
        </div>
        <label class="check">
          <input type="checkbox" checked={f.protein_source} onChange={set('protein_source')} />
          También es fuente de proteína (frijoles, platos con carne…)
        </label>

        <fieldset>
          <legend>Valores nutricionales</legend>
          <div class="seg">
            <button type="button" class={f.basis === 'porcion' ? 'on' : ''} onClick={() => setF({ ...f, basis: 'porcion' })}>Por porción</button>
            <button type="button" class={f.basis === '100' ? 'on' : ''} onClick={() => setF({ ...f, basis: '100' })}>Por 100 g</button>
          </div>
          <div class="grid3">
            <label>kcal<input type="number" inputmode="decimal" step="any" required value={f.kcal} onInput={set('kcal')} /></label>
            <label>Proteína<input type="number" inputmode="decimal" step="any" value={f.protein} onInput={set('protein')} /></label>
            <label>Carbos<input type="number" inputmode="decimal" step="any" value={f.carbs} onInput={set('carbs')} /></label>
            <label>Grasa<input type="number" inputmode="decimal" step="any" value={f.fat} onInput={set('fat')} /></label>
            <label>Fibra<input type="number" inputmode="decimal" step="any" value={f.fiber} onInput={set('fiber')} /></label>
          </div>
        </fieldset>

        {editing ? (
          <fieldset>
            <legend>Medidas</legend>
            <p class="muted hint">Marca la porción del empaque (●): los valores de arriba “por porción” se refieren a ella.</p>
            {measures.map((m, i) => (
              <div class="measure-row" key={m.id || `n${i}`}>
                <button type="button" class={`def-dot ${m.is_default ? 'on' : ''}`} aria-label={`Usar ${m.label || 'esta medida'} como porción del empaque`} onClick={setMeasure(i, 'is_default')} />
                <input value={m.label} placeholder="scoop, barra…" aria-label="Nombre de la medida" onInput={setMeasure(i, 'label')} />
                <input type="number" inputmode="decimal" step="any" value={m.grams} aria-label="Gramos" onInput={(e) => { if (m.is_default) setTouched(true); setMeasure(i, 'grams')(e); }} />
                <span class="muted">g</span>
                <button type="button" class="link danger" aria-label={`Quitar ${m.label}`} onClick={() => setMeasures(measures.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button type="button" class="link" onClick={() => setMeasures([...measures, { label: '', grams: '', is_default: !measures.length }])}>+ Medida</button>
          </fieldset>
        ) : (
        <fieldset>
          <legend>Porción del empaque {f.basis === '100' && '(opcional)'}</legend>
          <div class="grid2">
            <label>Medida<input value={f.serving_label} onInput={set('serving_label')} placeholder="galleta, scoop…" /></label>
            <label>Gramos / ml
              <input type="number" inputmode="decimal" step="any" required={f.basis === 'porcion'}
                value={f.serving_grams} onInput={set('serving_grams')} />
            </label>
          </div>
        </fieldset>
        )}

        {ready && (
          <div class="portion-preview">
            <span class="muted">{previewLabel} equivale a</span>
            <b>{describePortions(portionsFor(food, previewGrams, groups), groups)}</b>
          </div>
        )}
        {error && <p class="error">{error}</p>}
        {editing && <p class="muted hint">Al guardar se recalculan tus registros de este alimento con los datos corregidos.</p>}
        <button class="btn primary wide" disabled={busy || !ready}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Guardar y registrar'}</button>
      </form>
    </>
  );
}
