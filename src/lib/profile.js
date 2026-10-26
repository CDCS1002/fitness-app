/**
 * Perfil del usuario con sesión: si es administrador, su rutina semanal y sus reglas de
 * progresión. Se carga una vez por sesión y se comparte entre pantallas.
 */
import { useEffect, useState } from 'preact/hooks';
import { isAdmin, listRoutines, getStrengthSettings } from './api.js';
import { makeRoutines } from './routine.js';
import { progressionFrom } from './strength.js';

let state = { ready: false, error: '', isAdmin: false, routines: makeRoutines([]), routineRows: [], progression: progressionFrom(null), settings: null };
const subs = new Set();
const emit = () => subs.forEach((f) => f(state));
let loading = null;

export async function loadProfile() {
  loading ||= (async () => {
    const [admin, rows, settings] = await Promise.all([
      isAdmin(),
      listRoutines().catch((err) => ({ error: err.message })),
      getStrengthSettings().catch(() => null),
    ]);
    const missing = rows?.error;
    state = {
      ready: true,
      error: missing ? (/routines/.test(missing) ? 'Ejecuta la migración 0021 para cargar tu rutina.' : missing) : '',
      isAdmin: admin,
      routineRows: missing ? [] : rows,
      routines: makeRoutines(missing ? [] : rows),
      settings,
      progression: progressionFrom(settings),
    };
    emit();
  })().finally(() => { loading = null; });
  return loading;
}

/** Actualiza partes del perfil después de guardarlas (rutina o reglas). */
export function patchProfile({ routineRows, settings }) {
  if (routineRows) state = { ...state, routineRows, routines: makeRoutines(routineRows) };
  if (settings) state = { ...state, settings, progression: progressionFrom(settings) };
  emit();
}

export function resetProfile() {
  state = { ...state, ready: false, isAdmin: false, routines: makeRoutines([]), routineRows: [], settings: null, progression: progressionFrom(null) };
  emit();
}

export function useProfile() {
  const [s, setS] = useState(state);
  useEffect(() => {
    subs.add(setS);
    setS(state);
    return () => subs.delete(setS);
  }, []);
  return s;
}
