import { supabase } from './supabase.js';
import { groupsFromRows, macrosFor, portionsFor } from './portions.js';

// Plan vigente (consulta del 13/10/2026). Solo se usa si la cuenta aún no tiene planes.
export const DEFAULT_PLAN = {
  name: 'Plan 2',
  start_date: '2026-10-13',
  targets: { proteina: 16, carbohidrato: 9, grasa: 3, lacteo: 2, vegetal: 3, fruta: 2, azucar: 1 },
  kcal_target: 2060,
  protein_target: 158,
  carbs_target: 212,
  fat_target: 65,
};

const FOOD_COLS =
  'id,name,brand,barcode,state,category,primary_group,protein_source,kcal,protein,carbs,fat,fiber,portions_override,source,verified';

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export async function getGroups() {
  const rows = check(await supabase.from('exchange_groups').select('*').order('sort'));
  return groupsFromRows(rows);
}

/** Plan que aplica en una fecha; si no hay ninguno, crea el plan actual. */
export async function getPlanFor(date) {
  const rows = check(
    await supabase.from('plans').select('*').lte('start_date', date).order('start_date', { ascending: false }).limit(5),
  );
  const plan = rows.find((p) => !p.end_date || p.end_date >= date);
  if (plan) return plan;
  const any = check(await supabase.from('plans').select('id').limit(1));
  if (any.length) return null;
  return check(await supabase.from('plans').insert(DEFAULT_PLAN).select().single());
}

export async function entriesFor(date) {
  return check(
    await supabase.from('meal_entries').select('*').eq('eaten_on', date).order('created_at'),
  );
}

export async function searchFoods(q) {
  return check(await supabase.rpc('search_foods', { q, lim: 40 }));
}

export async function recentFoods() {
  const ids = check(await supabase.rpc('recent_foods', { lim: 15 }));
  const list = (ids || []).map((r) => (typeof r === 'string' ? r : r.recent_foods)).filter(Boolean);
  if (!list.length) return [];
  const foods = check(await supabase.from('foods').select(FOOD_COLS).in('id', list));
  return list.map((id) => foods.find((f) => f.id === id)).filter(Boolean);
}

export async function getFood(id) {
  const food = check(await supabase.from('foods').select(FOOD_COLS).eq('id', id).single());
  const measures = check(
    await supabase.from('food_measures').select('*').eq('food_id', id).order('grams'),
  );
  return { ...food, measures };
}

/** Arma un registro con la foto de macros y porciones del momento. */
function buildEntry({ food, date, meal, measure, quantity, groups }) {
  const grams = (measure ? Number(measure.grams) : 1) * quantity;
  const m = macrosFor(food, grams);
  const portions = portionsFor(food, grams, groups);
  const r2 = (n) => (n == null ? null : Math.round(n * 100) / 100);
  const row = {
    eaten_on: date,
    meal,
    food_id: food.id,
    food_name: food.name + (food.state ? ` · ${food.state}` : ''),
    food_brand: food.brand,
    measure_label: measure ? measure.label : 'g',
    quantity,
    grams: r2(grams),
    kcal: r2(m.kcal),
    protein: r2(m.protein),
    carbs: r2(m.carbs),
    fat: r2(m.fat),
    fiber: r2(m.fiber),
    portions: Object.fromEntries(Object.entries(portions).map(([k, v]) => [k, r2(v)])),
  };
  return row;
}

export async function addEntry(args) {
  return check(await supabase.from('meal_entries').insert(buildEntry(args)).select().single());
}

/** Recalcula un registro existente (cantidad, medida o tiempo de comida). */
export async function updateEntry(id, args) {
  return check(await supabase.from('meal_entries').update(buildEntry(args)).eq('id', id).select().single());
}


export async function deleteEntry(id) {
  check(await supabase.from('meal_entries').delete().eq('id', id));
}

export async function createFood(food, measures = []) {
  const { data: { user } } = await supabase.auth.getUser();
  const created = check(
    await supabase.from('foods').insert({ ...food, created_by: user.id }).select(FOOD_COLS).single(),
  );
  if (measures.length) {
    check(await supabase.from('food_measures').insert(measures.map((m) => ({ ...m, food_id: created.id }))));
  }
  return getFood(created.id);
}

// ---------------------------------------------------------------------
// Agua, pasos y actividad
// ---------------------------------------------------------------------
export async function getDailyLog(date) {
  return check(await supabase.from('daily_logs').select('*').eq('day', date).maybeSingle());
}

export async function addWater(date, deltaMl) {
  return Number(check(await supabase.rpc('add_water', { p_day: date, p_delta_ml: deltaMl })));
}

/** Guarda campos del registro diario (pasos, sueño, energía) sin tocar los demás. */
export async function setDailyFields(date, fields) {
  const { data: { session } } = await supabase.auth.getSession();
  return check(
    await supabase.from('daily_logs')
      .upsert({ user_id: session.user.id, day: date, ...fields }, { onConflict: 'user_id,day' })
      .select().single(),
  );
}

export const setSteps = (date, steps) => setDailyFields(date, { steps });

export async function activitiesFor(date) {
  return check(await supabase.from('activities').select('*').eq('day', date).order('created_at'));
}

export async function addActivity(row) {
  return check(await supabase.from('activities').insert(row).select().single());
}

export async function deleteActivity(id) {
  check(await supabase.from('activities').delete().eq('id', id));
}

// ---------------------------------------------------------------------
// Código de barras: primero tu base, luego Open Food Facts
// ---------------------------------------------------------------------
export async function findByBarcode(code) {
  const { barcodeVariants } = await import('./off.js');
  const rows = check(await supabase.from('foods').select('id').in('barcode', barcodeVariants(code)).limit(1));
  return rows.length ? getFood(rows[0].id) : null;
}

export async function updatePlan(id, patch) {
  return check(await supabase.from('plans').update(patch).eq('id', id).select().single());
}

// ---------------------------------------------------------------------
// Fuerza
// ---------------------------------------------------------------------
export async function listExercises() {
  return check(await supabase.from('exercises').select('*').order('name'));
}

/** Registros hasta una fecha (incluida), del más reciente al más antiguo. */
export async function strengthUpTo(date, limit = 600) {
  return check(
    await supabase.from('strength_entries').select('*').lte('day', date)
      .order('day', { ascending: false }).order('created_at', { ascending: false }).limit(limit),
  );
}

export async function exerciseHistory(exerciseId) {
  return check(
    await supabase.from('strength_entries').select('*').eq('exercise_id', exerciseId).order('day', { ascending: true }),
  );
}

export async function saveStrength(row) {
  const { id, ...data } = row;
  return check(
    id
      ? await supabase.from('strength_entries').update(data).eq('id', id).select().single()
      : await supabase.from('strength_entries').insert(data).select().single(),
  );
}

export async function deleteStrength(id) {
  check(await supabase.from('strength_entries').delete().eq('id', id));
}

export async function createExercise(row) {
  return check(await supabase.from('exercises').insert(row).select().single());
}

// ---------------------------------------------------------------------
// Progreso: peso, InBody y datos para el resumen semanal
// ---------------------------------------------------------------------
async function uid() {
  const { data: { session } } = await supabase.auth.getSession();
  return session.user.id;
}

export async function listWeights() {
  return check(await supabase.from('body_weights').select('day,weight_kg').order('day'));
}

export async function saveWeight(day, weight_kg) {
  return check(
    await supabase.from('body_weights').upsert({ user_id: await uid(), day, weight_kg }, { onConflict: 'user_id,day' }).select().single(),
  );
}

export async function deleteWeight(day) {
  check(await supabase.from('body_weights').delete().eq('day', day));
}

export async function listInbody() {
  return check(await supabase.from('inbody_scans').select('*').order('day'));
}

export async function saveInbody({ id, day, metrics, notes }) {
  const row = { day, metrics, notes: notes || null };
  return check(
    id
      ? await supabase.from('inbody_scans').update(row).eq('id', id).select().single()
      : await supabase.from('inbody_scans').insert(row).select().single(),
  );
}

export async function deleteInbody(id) {
  check(await supabase.from('inbody_scans').delete().eq('id', id));
}

/** Todo lo necesario para el resumen semanal entre dos fechas. */
export async function progressRange(from, to) {
  const [entries, legacy, logs, activities, strength, exercises, weights, plans] = await Promise.all([
    supabase.from('meal_entries').select('eaten_on,kcal,protein,carbs,fat,portions').gte('eaten_on', from).lte('eaten_on', to),
    supabase.from('legacy_days').select('*').gte('day', from).lte('day', to),
    supabase.from('daily_logs').select('day,water_ml,steps,sleep_h,energy').gte('day', from).lte('day', to),
    supabase.from('activities').select('day,active_kcal').gte('day', from).lte('day', to),
    supabase.from('strength_entries').select('day,exercise_id,weight_kg,sets').gte('day', from).lte('day', to),
    supabase.from('exercises').select('id,name,measure,body'),
    supabase.from('body_weights').select('day,weight_kg').gte('day', from).lte('day', to),
    supabase.from('plans').select('*'),
  ]).then((rs) => rs.map(check));
  return { entries, legacy, logs, activities, strength, exercises, weights, plans };
}

export async function listPlans() {
  return check(await supabase.from('plans').select('*').order('start_date', { ascending: false }));
}

// ---------------------------------------------------------------------
// Recalcular registros con el motor y los valores actuales de cada alimento
// ---------------------------------------------------------------------
export async function recalcEntries(groups, onProgress = () => {}) {
  const { macrosFor, portionsFor } = await import('./portions.js');
  const r2 = (n) => (n == null ? null : Math.round(n * 100) / 100);
  // Registros (paginados de 1000 en 1000)
  const entries = [];
  for (let from = 0; ; from += 1000) {
    const page = check(await supabase.from('meal_entries').select('id,food_id,grams,portions,kcal').not('food_id', 'is', null).range(from, from + 999));
    entries.push(...page);
    if (page.length < 1000) break;
  }
  // Alimentos involucrados
  const ids = [...new Set(entries.map((e) => e.food_id))];
  const foods = {};
  for (let i = 0; i < ids.length; i += 100) {
    for (const f of check(await supabase.from('foods').select(FOOD_COLS).in('id', ids.slice(i, i + 100)))) foods[f.id] = f;
  }
  // Solo actualiza los que cambian
  const changes = [];
  for (const e of entries) {
    const f = foods[e.food_id];
    if (!f) continue;
    const g = Number(e.grams);
    const m = macrosFor(f, g);
    const portions = Object.fromEntries(Object.entries(portionsFor(f, g, groups)).map(([k, v]) => [k, r2(v)]));
    const patch = { portions, kcal: r2(m.kcal), protein: r2(m.protein), carbs: r2(m.carbs), fat: r2(m.fat), fiber: r2(m.fiber) };
    if (JSON.stringify(portions) !== JSON.stringify(e.portions) || r2(m.kcal) !== Number(e.kcal)) changes.push([e.id, patch]);
  }
  let done = 0;
  for (let i = 0; i < changes.length; i += 10) {
    await Promise.all(changes.slice(i, i + 10).map(([id, patch]) => supabase.from('meal_entries').update(patch).eq('id', id).then(check)));
    done = Math.min(i + 10, changes.length);
    onProgress(done, changes.length);
  }
  return { total: entries.length, updated: changes.length };
}
