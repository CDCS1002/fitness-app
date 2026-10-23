import { test } from 'node:test';
import assert from 'node:assert/strict';
import { portionsFor, roundedPortions, describePortions, fmtHalf, sumPortions } from '../src/lib/portions.js';

// Convierte un ejemplo de KG (macros por porción de N gramos) a un alimento por 100 g.
const per100 = (grams, { p = 0, c = 0, g = 0, kcal = 0 }, extra) => ({
  kcal: (kcal * 100) / grams, protein: (p * 100) / grams, carbs: (c * 100) / grams, fat: (g * 100) / grams, ...extra,
});
const portions = (food, grams) => roundedPortions(portionsFor(food, grams));

test('Pan para hamburguesa 30 g → 1 carbohidrato', () => {
  const pan = per100(30, { p: 2.9, c: 15, g: 1.2 }, { primary_group: 'carbohidrato' });
  assert.deepEqual(portions(pan, 30), { carbohidrato: 1 });
});

test('Pasta en salsa blanca 80 g → 1 carbohidrato + ½ grasa', () => {
  const pasta = per100(80, { p: 3.4, c: 14.2, g: 2.8 }, { primary_group: 'carbohidrato' });
  assert.deepEqual(portions(pasta, 80), { carbohidrato: 1, grasa: 0.5 });
});

test('Arroz con camarones 60 g → 1 carbohidrato + ½ proteína', () => {
  const arroz = per100(60, { p: 3.4, c: 14.7, g: 1.1 }, { primary_group: 'carbohidrato', protein_source: true });
  assert.deepEqual(portions(arroz, 60), { proteina: 0.5, carbohidrato: 1 });
});

test('Aguacate 35 g → 1 grasa', () => {
  const aguacate = per100(35, { p: 0.9, c: 2.7, g: 5.1 }, { primary_group: 'grasa' });
  assert.deepEqual(portions(aguacate, 35), { grasa: 1 });
});

test('Ensalada lechuga, tomate y limón 140 g → 1 vegetal', () => {
  const ens = per100(140, { p: 1.4, c: 4.8, g: 0.3 }, { primary_group: 'vegetal' });
  assert.deepEqual(portions(ens, 140), { vegetal: 1 });
});

test('Pollo frito 200 g → 7½ proteínas semigrasas, su grasa va incluida', () => {
  const pollo = per100(200, { p: 53.6, c: 1, g: 22.2 }, { primary_group: 'proteina' });
  assert.deepEqual(portions(pollo, 200), { proteina: 7.5 });
});

test('Leche descremada 250 ml → ~1 lácteo, sin grasa extra', () => {
  const leche = { primary_group: 'lacteo', protein: 3.6, carbs: 5, fat: 0.5 };
  assert.deepEqual(portions(leche, 250), { lacteo: 1 });
});

test('El override por 100 g reemplaza el cálculo', () => {
  const f = { primary_group: 'carbohidrato', carbs: 50, portions_override: { carbohidrato: 2, proteina: 1 } };
  assert.deepEqual(portions(f, 50), { proteina: 0.5, carbohidrato: 1 });
});

test('Formato y suma', () => {
  assert.equal(fmtHalf(0.5), '½');
  assert.equal(fmtHalf(4.5), '4½');
  assert.equal(fmtHalf(3), '3');
  assert.equal(describePortions({ carbohidrato: 1, proteina: 0.49 }), '½ proteína + 1 carbohidrato');
  assert.deepEqual(sumPortions([{ portions: { grasa: 0.3 } }, { portions: { grasa: 0.4, fruta: 1 } }]), { grasa: 0.7, fruta: 1 });
});

test('El total del día suma las porciones redondeadas de cada registro', async () => {
  const { sumRoundedPortions } = await import('../src/lib/portions.js');
  const day = [
    { portions: { carbohidrato: 3.76, grasa: 0.12 } },
    { portions: { proteina: 4.8, grasa: 1.44 } },
    { portions: { lacteo: 1.08, grasa: 0.19 } },
    { portions: { grasa: 1.51 } },
  ];
  assert.deepEqual(sumRoundedPortions(day), { carbohidrato: 4, proteina: 5, grasa: 3, lacteo: 1 });
});

// ---------- Lista de la Licda. Ruiz (motor combinado) ----------
import { subtypeFor } from '../src/lib/portions.js';

test('Leche entera 1 taza → 1 lácteo entero, sin grasa extra', () => {
  const leche = { primary_group: 'lacteo', protein: 3.2, carbs: 4.8, fat: 3.3 };
  assert.deepEqual(portions(leche, 250), { lacteo: 1 });
  assert.equal(subtypeFor(leche), 'entero');
});

test('Leche alta en proteína: 1 lácteo por taza (antes salía 1½)', () => {
  const leche = { primary_group: 'lacteo', protein: 5.1, carbs: 4.8, fat: 0.5 };
  assert.equal(portions(leche, 250).lacteo, 1);
});

test('Yogur endulzado: los carbos extra cuentan como azúcar', () => {
  const yog = { primary_group: 'lacteo', protein: 3.5, carbs: 13, fat: 1 }; // 1 unidad 150 g
  assert.deepEqual(portions(yog, 150), { lacteo: 0.5, azucar: 2.5 });
  const natural = { primary_group: 'lacteo', protein: 3.5, carbs: 4.7, fat: 3.3 }; // sin azúcar, 1 taza
  assert.deepEqual(portions(natural, 245), { lacteo: 1 });
});

test('Pechuga cocida 120 g → proteína magra sin grasa', () => {
  const pollo = { primary_group: 'proteina', protein: 31, carbs: 0, fat: 3.6 };
  assert.deepEqual(portions(pollo, 120), { proteina: 5.5 });
  assert.equal(subtypeFor(pollo), 'magra');
});

test('Queso tico 30 g → 1 proteína grasa', () => {
  const queso = { primary_group: 'proteina', protein: 20, carbs: 3, fat: 24 };
  assert.equal(subtypeFor(queso), 'grasa');
  assert.deepEqual(portions(queso, 30), { proteina: 1 });
});

test('Frijoles ½ taza (86 g) → ~1½ harinas + 1 proteína (lista: 1 + 1)', () => {
  const f = { primary_group: 'carbohidrato', protein_source: true, protein: 8.9, carbs: 23.7, fat: 0.5 };
  assert.deepEqual(portions(f, 86), { proteina: 1, carbohidrato: 1.5 });
});

test('Arroz cocido ½ taza (82 g) → 1½ harinas (la lista dice 1)', () => {
  assert.deepEqual(portions({ primary_group: 'carbohidrato', protein: 2.7, carbs: 28.2, fat: 0.3 }, 82), { carbohidrato: 1.5 });
});

test('Almendras 1½ cdita (8 g) → ~1 grasa + ½ proteína como en la lista', () => {
  const a = { primary_group: 'grasa', protein_source: true, protein: 21.2, carbs: 21.6, fat: 49.9 };
  const r = portionsFor(a, 8);
  assert.equal(Math.round(r.grasa * 2) / 2, 1);
  assert.ok(r.proteina > 0.2 && r.proteina < 0.5);
});

test('Cerdo empanizado: carbos del empanizado cuentan como harina', () => {
  const c = { primary_group: 'proteina', protein: 24, carbs: 10, fat: 14.5 };
  assert.deepEqual(portions(c, 90), { proteina: 3, carbohidrato: 0.5 });
});
