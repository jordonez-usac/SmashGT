const { test } = require('node:test');
const assert = require('node:assert/strict');
const { unirJugadores } = require('../utils/mergeJugadores');

test('une jugadores repetidos entre rankings y los ordena alfabéticamente', () => {
    const unidos = unirJugadores([
        { titulo: '2026', jugadores: [{ nombre: 'Zeta', player_id: '7' }, { nombre: 'ánima' }] },
        { titulo: '2025', jugadores: [{ nombre: 'Zeta Viejo', player_id: '7', skin: 'wolf:0' }, { nombre: 'Ánima ', team: 'GT' }, { nombre: 'Beto' }] }
    ]);
    assert.deepEqual(unidos.map(j => j.nombre), ['ánima', 'Beto', 'Zeta']);
    const zeta = unidos.find(j => j.nombre === 'Zeta');
    assert.deepEqual(zeta.rankings, ['2026', '2025']);
    assert.equal(zeta.skin, 'wolf:0');
    assert.equal(unidos[0].team, 'GT');
});
