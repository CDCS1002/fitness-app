// Semana tipo (hoja Configuración del Sheet). ISO: 1 = lunes … 7 = domingo.
export const ROUTINE = {
  1: 'Full body + abdomen',
  2: 'Espalda, bíceps y hombro + abdomen',
  3: 'Pierna + abdomen',
  4: 'Pecho, tríceps y hombro + abdomen',
  5: 'Cardio + abdomen',
  6: 'Descanso',
  7: 'Descanso',
};
export const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const isoDow = (date) => ((date.getDay() + 6) % 7) + 1;
