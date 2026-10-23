/**
 * Medicamentos y suplementos: catálogo personal, tomas del día y búsqueda por código de barras.
 *
 * Búsqueda por código: tu catálogo → NIH Dietary Supplement Label Database (suplementos de EE. UU.,
 * con dosis por ingrediente) → Open Food Facts (algunos suplementos) → alta manual.
 * Los medicamentos con receta no tienen una base pública con códigos de Costa Rica.
 */
import { fromISO } from './dates.js';

export const KINDS = [
  { code: 'suplemento', name: 'Suplemento', icon: '💊' },
  { code: 'medicamento', name: 'Medicamento', icon: '🩺' },
  { code: 'anticonceptivo', name: 'Anticonceptivo', icon: '🗓️' },
  { code: 'otro', name: 'Otro', icon: '➕' },
];
export const FORMS = ['cápsula', 'tableta', 'polvo', 'líquido', 'gotas', 'inyección', 'parche', 'otro'];
export const kindOf = (code) => KINDS.find((k) => k.code === code) || KINDS[3];

const isoDow = (iso) => ((fromISO(iso).getDay() + 6) % 7) + 1;

/** Activos que se toman ese día, con sus tomas registradas, ordenados por hora. */
export function medsForDay(meds, logs, day) {
  const dow = isoDow(day);
  const scheduled = meds.filter((m) => m.active && (m.days || []).includes(dow));
  const extra = meds.filter((m) => !scheduled.includes(m) && logs.some((l) => l.med_id === m.id));
  const first = (m) => (m.times?.length ? [...m.times].sort()[0] : '99:99');
  return [...scheduled, ...extra]
    .map((m) => ({
      med: m,
      planned: scheduled.includes(m) ? Math.max(1, m.times?.length || 1) : 0,
      taken: logs.filter((l) => l.med_id === m.id).sort((a, b) => String(a.taken_at).localeCompare(String(b.taken_at))),
    }))
    .sort((a, b) => first(a.med).localeCompare(first(b.med)) || a.med.name.localeCompare(b.med.name));
}

const COUNTABLE = /^(cápsula|tableta|gomita|unidad|sobre|gota|scoop|pastilla)$/;
export function doseLabel(m, amount = m.dose_amount, unit = m.dose_unit) {
  if (amount == null) return unit || '';
  const n = new Intl.NumberFormat('es', { maximumFractionDigits: 2 }).format(Number(amount));
  const u = unit && Number(amount) !== 1 && COUNTABLE.test(unit) ? `${unit}s` : unit;
  return `${n} ${u || ''}`.trim();
}

export function ingredientsLabel(ings = []) {
  return ings
    .filter((i) => i?.name)
    .map((i) => (i.amount != null ? `${i.name} ${new Intl.NumberFormat('es', { maximumFractionDigits: 2 }).format(i.amount)} ${i.unit || ''}`.trim() : i.name))
    .join(' · ');
}

/* ----------------------------- Código de barras ----------------------------- */

/** UPC-A con el formato con espacios que guarda la base del NIH: "7 48927 02573 6". */
export function dsldUpc(code) {
  let c = String(code).replace(/\D/g, '');
  if (c.length === 13 && c.startsWith('0')) c = c.slice(1);
  if (c.length !== 12) return null;
  return `${c[0]} ${c.slice(1, 6)} ${c.slice(6, 11)} ${c[11]}`;
}

const DSLD = 'https://api.ods.od.nih.gov/dsld/v9';
const UNIT = { 'Gram(s)': 'g', 'mg': 'mg', 'mcg': 'mcg', 'IU': 'UI', 'mL': 'ml', 'Capsule(s)': 'cápsula', 'Tablet(s)': 'tableta',
  'Softgel(s)': 'cápsula', 'Scoop(s)': 'scoop', 'Gummy(ies)': 'gomita', 'Piece(s)': 'unidad', 'Packet(s)': 'sobre' };
const unitEs = (u) => UNIT[u] || (u ? u.replace(/\(s\)$/, '').toLowerCase() : null);

function flattenRows(rows = []) {
  return rows.flatMap((r) => [r, ...flattenRows(r.nestedRows || [])]);
}

/** Convierte una etiqueta del NIH en los campos del formulario. */
export function mapDsld(label, code) {
  const serving = (label.servingSizes || [])[0] || {};
  const formU = unitEs(serving.unit);
  const ings = flattenRows(label.ingredientRows)
    .map((r) => {
      const q = (r.quantity || [])[0] || {};
      return { name: r.name, amount: q.quantity ?? null, unit: unitEs(q.unit) };
    })
    .filter((i) => i.name);
  const physical = (label.physicalState?.langualCodeDescription || '').toLowerCase();
  const form = /powder/.test(physical) ? 'polvo' : /capsule|softgel/.test(physical) ? 'cápsula' : /tablet/.test(physical) ? 'tableta'
    : /liquid/.test(physical) ? 'líquido' : formU === 'cápsula' || formU === 'tableta' ? formU : null;
  return {
    name: label.fullName || '',
    brand: label.brandName || '',
    kind: 'suplemento',
    form,
    dose_amount: serving.minQuantity ?? '',
    dose_unit: formU || '',
    ingredients: ings,
    barcode: code,
    source: 'dsld',
  };
}

export async function fetchDsld(code, { signal } = {}) {
  const upc = dsldUpc(code);
  if (!upc) return null;
  const res = await fetch(`${DSLD}/search-filter?q=${encodeURIComponent(`"${upc}"`)}&size=1`, { signal });
  if (!res.ok) return null;
  const hit = (await res.json())?.hits?.[0];
  if (!hit?._id) return null;
  const lab = await fetch(`${DSLD}/label/${hit._id}`, { signal });
  return lab.ok ? mapDsld(await lab.json(), String(code).replace(/\D/g, '')) : null;
}

/** Open Food Facts como respaldo: nombre, marca y porción (sin dosis por ingrediente). */
export function mapOffSupplement(p, code) {
  const serving = p.serving_size || '';
  const num = parseFloat((serving.match(/[\d.,]+/) || [''])[0].replace(',', '.'));
  const unit = /cáps|caps/i.test(serving) ? 'cápsula' : /tab/i.test(serving) ? 'tableta' : /ml/i.test(serving) ? 'ml' : /g\b/i.test(serving) ? 'g' : '';
  return {
    name: (p.product_name_es || p.product_name || '').trim(),
    brand: (p.brands || '').split(',')[0].trim(),
    kind: 'suplemento',
    form: unit === 'g' ? 'polvo' : unit === 'cápsula' || unit === 'tableta' ? unit : null,
    dose_amount: Number.isFinite(num) ? num : '',
    dose_unit: unit,
    ingredients: [],
    barcode: code,
    source: 'openfoodfacts',
  };
}
