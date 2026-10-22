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

test('Pollo frito 200 g → 7½–8 proteínas + 4½ grasas', () => {
  const pollo = per100(200, { p: 53.6, c: 1, g: 22.2 }, { primary_group: 'proteina' });
  const r = portions(pollo, 200);
  assert.equal(r.grasa, 4.5);
  // KG reporta 8; con 7 g por porción da 7.66 → 7½. Ver nota en el README.
  assert.ok(r.proteina >= 7.5 && r.proteina <= 8);
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
