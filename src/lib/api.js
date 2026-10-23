import { supabase } from './supabase.js';
import { groupsFromRows, macrosFor, portionsFor } from './portions.js';

// Plan vigente en el Sheet (Configuración) al iniciar la app.
export const DEFAULT_PLAN = {
  name: 'Plan actual',
  start_date: '2026-09-28',
  targets: { proteina: 15, carbohidrato: 9, grasa: 3, lacteo: 2, vegetal: 3, fruta: 2 },
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

/** Arma y guarda un registro con la foto de macros y porciones. */
export async function addEntry({ food, date, meal, measure, quantity, groups }) {
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
  return check(await supabase.from('meal_entries').insert(row).select().single());
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

export async function setSteps(date, steps) {
  const { data: { session } } = await supabase.auth.getSession();
  return check(
    await supabase.from('daily_logs')
      .upsert({ user_id: session.user.id, day: date, steps }, { onConflict: 'user_id,day' })
      .select().single(),
  );
}

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
