import { fromISO } from './dates.js';

// Tipos de actividad según tu rutina
export const ACTIVITY_KINDS = [
  { code: 'fuerza', name: 'Fuerza', icon: '🏋️', titles: ['Full body', 'Espalda · Bíceps · Hombro', 'Pierna', 'Pecho · Tríceps · Hombro', 'Abdomen'] },
  { code: 'cardio', name: 'Cardio', icon: '🔥', titles: ['Caminadora', 'Stairmaster', 'Bicicleta', 'Elíptica'] },
  { code: 'natacion', name: 'Natación', icon: '🏊', titles: ['Natación'] },
  { code: 'caminata', name: 'Caminata', icon: '🐕', titles: ['Paseo de perros', 'Caminata'] },
  { code: 'otro', name: 'Otro', icon: '⚡', titles: [] },
];
export const kindOf = (code) => ACTIVITY_KINDS.find((k) => k.code === code) || ACTIVITY_KINDS[4];

export const GLASS_ML = 250;

/** Día de entreno según el plan (ISO: 1 = lunes … 7 = domingo). */
export function isTrainingDay(iso, plan) {
  const dow = ((fromISO(iso).getDay() + 6) % 7) + 1;
  return (plan?.training_days || [1, 2, 3, 4, 5]).includes(dow);
}

export function waterTarget(iso, plan) {
  return Number(isTrainingDay(iso, plan) ? plan?.water_train_ml ?? 3550 : plan?.water_rest_ml ?? 2800);
}
