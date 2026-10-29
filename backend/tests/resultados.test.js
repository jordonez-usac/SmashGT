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

test('sirve la copia guardada al instante y la actualiza por detrás cuando vence', async () => {
    const Instantanea = require('../models/Instantanea');
    const { resultadosDeGuatemala } = require('../controllers/startggController');
    const fetchOriginal = global.fetch, relojOriginal = Date.now, metodos = { findOne: Instantanea.findOne, updateOne: Instantanea.updateOne };
    let momento = 1791489600000, llamadas = 0, guardados = 0;
    Date.now = () => momento;
    Instantanea.findOne = () => ({ lean: async () => ({ momento: new Date(momento - 60000), datos: ['copia guardada'] }) });
    Instantanea.updateOne = async () => { guardados++; };
    global.fetch = async () => {
        llamadas++;
        const evento = { id: 1, name: 'Singles', slug: 'e/s', numEntrants: 9, standings: { nodes: [{ placement: 1, entrant: { name: 'A', participants: [{ player: { id: 9 } }] } }] } };
        return { ok: true, json: async () => ({ data: { tournaments: { pageInfo: { totalPages: 1 }, nodes: [{ id: 5, name: 'Nuevo', slug: 't/n', startAt: 1, events: [evento] }] } } }) };
    };
    try {
        assert.deepEqual(await resultadosDeGuatemala(), ['copia guardada']);
        assert.equal(llamadas, 0, 'con copia vigente no consulta start.gg');

        momento += 31 * 60 * 1000;
        assert.deepEqual(await resultadosDeGuatemala(), ['copia guardada'], 'vencida, igual responde al instante');
        for (let i = 0; i < 100 && !guardados; i++) await new Promise((r) => setTimeout(r, 30));
        assert.equal(llamadas, 1);
        assert.equal(guardados, 1);
        assert.equal((await resultadosDeGuatemala())[0].nombre, 'Nuevo');
        assert.equal(llamadas, 1);
    } finally {
        global.fetch = fetchOriginal; Date.now = relojOriginal; Object.assign(Instantanea, metodos);
    }
});
