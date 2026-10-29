const { test } = require('node:test');
const assert = require('node:assert/strict');
const { torneosDeGuatemala } = require('../controllers/startggController');

test('pagina los torneos, guarda los que no tienen coordenadas y no repite consultas simultáneas', async () => {
    const fetchOriginal = global.fetch;
    const paginas = [];
    global.fetch = async (_url, opciones) => {
        const { pagina } = JSON.parse(opciones.body).variables;
        paginas.push(pagina);
        const nodo = pagina === 1
            ? { id: 1, name: 'Con mapa', lat: 14.6, lng: -90.5, slug: 'tournament/a' }
            : { id: 2, name: 'Sin mapa', slug: 'tournament/b' };
        return { ok: true, json: async () => ({ data: { tournaments: { pageInfo: { totalPages: 2 }, nodes: [nodo] } } }) };
    };
    try {
        const [a, b] = await Promise.all([torneosDeGuatemala(), torneosDeGuatemala()]);
        assert.equal(a, b);
        assert.deepEqual(paginas, [1, 2]);
        assert.deepEqual(a.map((t) => [t.nombre, t.lugar.lat]), [['Con mapa', 14.6], ['Sin mapa', null]]);
    } finally { global.fetch = fetchOriginal; }
});
