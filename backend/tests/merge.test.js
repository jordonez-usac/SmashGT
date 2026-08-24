const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mergeJugadores } = require('../utils/mergeJugadores');

const guardado = [{ puesto: 20, nombre: 'Daak', skin: 'wolf:0', matches: { wins: 52, losses: 29, winRate: '64%' }, matchups: { mostWon: { value: '3x', opponent: 'X' } } }];

test('una edición normal hereda el récord guardado', () => {
    const [j] = mergeJugadores(guardado, [{ puesto: 20, nombre: 'Daak', matches: {}, matchups: {} }]);
    assert.equal(j.matches.wins, 52);
});

test('un import de CSV reemplaza el récord aunque venga vacío, pero conserva la skin', () => {
    const [j] = mergeJugadores(guardado, [{ puesto: 21, nombre: 'Daak', puntos: 6468, h2h: [], matches: {}, matchups: {} }], { reemplazarH2H: true });
    assert.deepEqual(j.matches, {});
    assert.equal(j.skin, 'wolf:0');
    assert.equal(j.puntos, 6468);
});
