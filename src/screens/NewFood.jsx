import { useState } from 'preact/hooks';
import { createFood } from '../lib/api.js';
import { GROUP_ORDER, portionsFor, describePortions } from '../lib/portions.js';

/**
 * Alta de un alimento. Acepta los valores tal como vienen en la etiqueta
 * ("por porción de 30 g") o por 100 g, y puede venir prellenado desde
 * Open Food Facts (`initial` + `source`).
 */
export function NewFood({ initial = {}, source = 'etiqueta', notice, groups, onBack, onCreated }) {
  const [f, setF] = useState({
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
    setF({ ...f, [k]: t.type === 'checkbox' ? t.checked : t.value });
  };

  const servingG = Number(f.serving_grams);
  const factor = f.basis === '100' ? 1 : servingG > 0 ? 100 / servingG : 0;
  const num = (v) => (v === '' || v == null ? null : Number(v));
  const per100 = (v) => (num(v) == null ? null : Math.round(num(v) * factor * 100) / 100);
  const food = {
    primary_group: f.primary_group, protein_source: f.protein_source,
    kcal: per100(f.kcal) ?? 0, protein: per100(f.protein) ?? 0, carbs: per100(f.carbs) ?? 0, fat: per100(f.fat) ?? 0,
  };
  const previewGrams = servingG > 0 ? servingG : 100;
  const previewLabel = servingG > 0 ? `1 ${f.serving_label || 'porción'} (${servingG} g)` : '100 g';
  const ready = f.name.trim() && factor > 0 && f.kcal !== '';

  async function save(e) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError('');
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
        <button class="link" onClick={onBack}>‹ Buscar</button>
        <b>Nuevo alimento</b>
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

        {ready && (
          <div class="portion-preview">
            <span class="muted">{previewLabel} equivale a</span>
            <b>{describePortions(portionsFor(food, previewGrams, groups), groups)}</b>
          </div>
        )}
        {error && <p class="error">{error}</p>}
        <button class="btn primary wide" disabled={busy || !ready}>{busy ? 'Guardando…' : 'Guardar y registrar'}</button>
      </form>
    </>
  );
}
