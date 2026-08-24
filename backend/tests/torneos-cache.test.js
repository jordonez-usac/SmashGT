const { test } = require('node:test');
const assert = require('node:assert/strict');
const { torneosDeGuatemala } = require('../controllers/startggController');

test('reutiliza la consulta de torneos durante diez minutos aunque cambie el segundo', async () => {
    const fetchOriginal = global.fetch, relojOriginal = Date.now;
    let momento = 1791489600000, llamadas = 0;
    Date.now = () => momento;
    global.fetch = async () => {
        llamadas++;
        return { ok: true, json: async () => ({ data: { tournaments: { nodes: [{ id: 1, name: 'Prueba', lat: 14.6, lng: -90.5, slug: 'tournament/prueba', startAt: momento / 1000 }] } } }) };
    };
    try {
        const primera = await torneosDeGuatemala();
        momento += 2000;
        assert.deepEqual(await torneosDeGuatemala(), primera);
        assert.equal(llamadas, 1);
        momento += 10 * 60 * 1000;
        await torneosDeGuatemala();
        assert.equal(llamadas, 2);
    } finally { global.fetch = fetchOriginal; Date.now = relojOriginal; }
});
