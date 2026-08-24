const { test } = require('node:test');
const assert = require('node:assert/strict');
const { armarResultado } = require('../controllers/startggController');

test('el evento con más entrantes va primero y los dobles no enlazan a un perfil', () => {
    const fila = (puesto, nombre, ids) => ({ placement: puesto, entrant: { name: nombre, participants: ids.map((id) => ({ player: { id } })) } });
    const r = armarResultado({
        id: 7, name: 'Local', slug: 'tournament/local', startAt: 100, events: [
            { id: 1, name: 'Doubles', slug: 'e/d', numEntrants: 8, standings: { nodes: [fila(1, 'A + B', [1, 2])] } },
            { id: 2, name: 'Singles', slug: 'e/s', numEntrants: 30, standings: { nodes: [fila(1, 'A', [1])] } },
            { id: 3, name: 'Vacío', slug: 'e/v', numEntrants: 0, standings: { nodes: [] } },
        ],
    });
    assert.deepEqual(r.eventos.map((e) => e.nombre), ['Singles', 'Doubles']);
    assert.equal(r.eventos[0].top[0].player_id, '1');
    assert.equal(r.eventos[1].top[0].player_id, null);
    assert.equal(r.fecha, 100000);
});
