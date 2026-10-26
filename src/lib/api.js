import { supabase } from './supabase.js';
import { groupsFromRows, macrosFor, portionsFor } from './portions.js';

// Plan vigente (consulta del 13/10/2026). Solo se usa si la cuenta aún no tiene planes.

const FOOD_COLS =
  'id,name,brand,barcode,state,category,primary_group,protein_source,kcal,protein,carbs,fat,fiber,portions_override,source,verified,created_by';

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export async function getGroups() {
  const rows = check(await supabase.from('exchange_groups').select('*').order('sort'));
  return groupsFromRows(rows);
}

/** Plan que aplica en una fecha (null si el usuario aún no tiene plan para esa fecha). */
export async function getPlanFor(date) {
  const rows = check(
    await supabase.from('plans').select('*').lte('start_date', date).order('start_date', { ascending: false }).limit(5),
  );
  return rows.find((p) => !p.end_date || p.end_date >= date) || null;
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

let cachedUserId = null;
export async function currentUserId() {
  if (cachedUserId) return cachedUserId;
  const { data: { session } } = await supabase.auth.getSession();
  cachedUserId = session?.user?.id || null;
  return cachedUserId;
}

/**
 * Corrige un alimento creado por el usuario: datos, medidas y registros hechos con él.
 * @param food      alimento como estaba (con measures)
 * @param fields    columnas nuevas de foods
 * @param measures  medidas nuevas ({ id?, label, grams, is_default })
 * @returns { food, updated } alimento recargado y cuántos registros se recalcularon
 */
export async function updateFood(food, fields, measures, groups) {
  const { entryPatches } = await import('./foodEdit.js');
  check(await supabase.from('foods').update(fields).eq('id', food.id));
  const keep = new Set(measures.filter((m) => m.id).map((m) => m.id));
  const removed = food.measures.filter((m) => !keep.has(m.id)).map((m) => m.id);
  if (removed.length) check(await supabase.from('food_measures').delete().in('id', removed));
  for (const m of measures.filter((x) => x.id)) {
    check(await supabase.from('food_measures').update({ label: m.label, grams: m.grams, is_default: m.is_default }).eq('id', m.id));
  }
  const added = measures.filter((m) => !m.id);
  if (added.length) {
    check(await supabase.from('food_measures').insert(added.map((m) => ({ food_id: food.id, label: m.label, grams: m.grams, is_default: m.is_default }))));
  }
  const fresh = await getFood(food.id);
  const entries = check(await supabase.from('meal_entries')
    .select('id,measure_label,quantity,grams,kcal,protein,carbs,fat,fiber,portions,food_name,food_brand').eq('food_id', food.id));
  const patches = entryPatches(entries, food.measures, measures, fresh, groups);
  for (const { id, patch } of patches) check(await supabase.from('meal_entries').update(patch).eq('id', id));
  return { food: fresh, updated: patches.length };
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
/**
 * Catálogo común de ejercicios con las preferencias del usuario (días de rutina, archivado).
 * Si la migración 0021 aún no se corrió, usa los días guardados en el propio ejercicio.
 */
export async function listExercises() {
  const { data, error } = await supabase.from('exercises').select('*, prefs:exercise_prefs(days,archived)').order('name');
  if (error) {
    if (!/exercise_prefs|relationship/i.test(error.message)) throw new Error(error.message);
    return check(await supabase.from('exercises').select('*').order('name'));
  }
  return data.map(({ prefs, ...e }) => ({ ...e, days: prefs?.[0]?.days ?? [], archived: prefs?.[0]?.archived ?? false }));
}

/** Días de rutina y archivado de un ejercicio para el usuario actual. */
export async function saveExercisePrefs(exerciseId, { days, archived = false }) {
  const user_id = await uid();
  check(await supabase.from('exercise_prefs')
    .upsert({ user_id, exercise_id: exerciseId, days, archived }, { onConflict: 'user_id,exercise_id' }));
}

/** Datos generales de un ejercicio del catálogo (solo el administrador). */
export async function updateExercise(id, fields) {
  return check(await supabase.from('exercises').update(fields).eq('id', id).select().single());
}

// ---------------------------------------------------------------------
// Perfil: administrador, rutina semanal y reglas de progresión
// ---------------------------------------------------------------------
export async function isAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return !!data;
}

export async function listRoutines() {
  return check(await supabase.from('routines').select('*').order('weekday'));
}

export async function saveRoutines(rows) {
  const user_id = await uid();
  return check(await supabase.from('routines')
    .upsert(rows.map((r) => ({ user_id, weekday: r.weekday, name: r.name, full_name: r.full_name || r.name, is_rest: !!r.is_rest })),
      { onConflict: 'user_id,weekday' }).select().order('weekday'));
}

export async function getStrengthSettings() {
  return check(await supabase.from('strength_settings').select('*').maybeSingle());
}

export async function saveStrengthSettings(fields) {
  const user_id = await uid();
  return check(await supabase.from('strength_settings').upsert({ user_id, ...fields }, { onConflict: 'user_id' }).select().single());
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

/** Agrega un ejercicio al catálogo común y, si trae días, los guarda como preferencia propia. */
export async function createExercise({ days = [], ...row }) {
  const created_by = await uid();
  const ex = check(await supabase.from('exercises').insert({ ...row, created_by }).select().single());
  if (days.length) await saveExercisePrefs(ex.id, { days });
  return { ...ex, days, archived: false };
}

// ---------------------------------------------------------------------
// Progreso: peso, InBody y datos para el resumen semanal
// ---------------------------------------------------------------------
async function uid() {
  const { data: { session } } = await supabase.auth.getSession();
  return session.user.id;
}

export async function listWeights() {
  // Sin la migración 0011 no existen grasa y músculo: se piden solo si están
  const full = await supabase.from('body_weights').select('day,weight_kg,fat_pct,muscle_kg').order('day');
  if (!full.error) return full.data;
  return check(await supabase.from('body_weights').select('day,weight_kg').order('day'));
}

/** Pesaje de la báscula de casa (FitDays). Grasa y músculo son opcionales. */
export async function saveWeight(day, weight_kg, extra = {}) {
  const row = { user_id: await uid(), day, weight_kg };
  if (extra.fat_pct !== undefined) row.fat_pct = extra.fat_pct;
  if (extra.muscle_kg !== undefined) row.muscle_kg = extra.muscle_kg;
  return check(await supabase.from('body_weights').upsert(row, { onConflict: 'user_id,day' }).select().single());
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
    supabase.from('daily_logs').select('*').gte('day', from).lte('day', to),
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

// ---------------------------------------------------------------------
// Medicamentos y suplementos
// ---------------------------------------------------------------------
export async function listMeds() {
  return check(await supabase.from('meds').select('*').order('name'));
}

export async function saveMed(row) {
  const { id, ...data } = row;
  return check(
    id
      ? await supabase.from('meds').update(data).eq('id', id).select().single()
      : await supabase.from('meds').insert(data).select().single(),
  );
}

export async function medLogsFor(day) {
  return check(await supabase.from('med_logs').select('*').eq('day', day).order('taken_at'));
}

export async function logMed(row) {
  return check(await supabase.from('med_logs').insert(row).select().single());
}

export async function deleteMedLog(id) {
  check(await supabase.from('med_logs').delete().eq('id', id));
}

/** Código de barras: tu catálogo → NIH (suplementos de EE. UU.) → Open Food Facts. */
export async function lookupMedBarcode(code) {
  const { barcodeVariants } = await import('./off.js');
  const own = check(await supabase.from('meds').select('*').in('barcode', barcodeVariants(code)).limit(1));
  if (own.length) return { med: own[0] };
  const { fetchDsld, mapOffSupplement } = await import('./meds.js');
  try {
    const d = await fetchDsld(code);
    if (d) return { draft: d };
  } catch { /* sin conexión con el NIH: se sigue con Open Food Facts */ }
  try {
    const { fetchOFF } = await import('./off.js');
    const p = await fetchOFF(code);
    if (p) return { draft: mapOffSupplement(p, String(code)) };
  } catch { /* sin conexión */ }
  return { draft: null };
}

// ---------------------------------------------------------------------
// Emociones
// ---------------------------------------------------------------------
export async function moodsFor(day) {
  return check(await supabase.from('mood_entries').select('*').eq('day', day).order('at_time', { nullsFirst: false }));
}

export async function moodsRange(from, to) {
  return check(await supabase.from('mood_entries').select('*').gte('day', from).lte('day', to).order('day'));
}

export async function saveMood(row) {
  const { id, ...data } = row;
  return check(
    id
      ? await supabase.from('mood_entries').update(data).eq('id', id).select().single()
      : await supabase.from('mood_entries').insert(data).select().single(),
  );
}

export async function deleteMood(id) {
  check(await supabase.from('mood_entries').delete().eq('id', id));
}

/** Áreas propias usadas antes (además de las predeterminadas). */
export async function usedAreas() {
  const rows = check(await supabase.from('mood_entries').select('areas').order('created_at', { ascending: false }).limit(300));
  return [...new Set(rows.flatMap((r) => r.areas || []))];
}

/**
 * Contexto por día para cruzar con las emociones: sueño (y fases), energía,
 * si entrenó (fuerza o actividad) y si las kcal quedaron dentro del rango del plan.
 */
export async function dayContextRange(from, to) {
  const { dayTargets } = await import('./targets.js');
  const { planFor } = await import('./weekly.js');
  const [logs, acts, strength, entries, plans] = await Promise.all([
    supabase.from('daily_logs').select('*').gte('day', from).lte('day', to),
    supabase.from('activities').select('day,active_kcal').gte('day', from).lte('day', to),
    supabase.from('strength_entries').select('day').gte('day', from).lte('day', to),
    supabase.from('meal_entries').select('eaten_on,kcal').gte('eaten_on', from).lte('eaten_on', to),
    supabase.from('plans').select('*'),
  ]).then((rs) => rs.map(check));
  const out = {};
  const day = (d) => (out[d] ||= {});
  for (const l of logs) {
    Object.assign(day(l.day), {
      sleepH: l.sleep_h != null ? Number(l.sleep_h) : null,
      energy: l.energy ?? null,
      stages: l.sleep_rem_min != null || l.sleep_deep_min != null
        ? { awake: l.sleep_awake_min, rem: l.sleep_rem_min, core: l.sleep_core_min, deep: l.sleep_deep_min } : null,
      steps: l.steps ?? null,
    });
  }
  for (const a of acts) { const d = day(a.day); d.trained = true; d.activeKcal = (d.activeKcal || 0) + Number(a.active_kcal || 0); }
  for (const s of strength) { const d = day(s.day); d.trained = true; d.strengthExercises = (d.strengthExercises || 0) + 1; }
  const kcal = {};
  for (const e of entries) kcal[e.eaten_on] = (kcal[e.eaten_on] || 0) + Number(e.kcal || 0);
  for (const [d, k] of Object.entries(kcal)) {
    const t = dayTargets(planFor(plans, d));
    Object.assign(day(d), { kcal: Math.round(k), kcalInRange: k >= t.low && k <= t.high, kcalLow: t.low, kcalHigh: t.high });
  }
  return out;
}
