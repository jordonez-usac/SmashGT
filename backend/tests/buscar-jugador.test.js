const { test } = require('node:test');
const assert = require('node:assert/strict');
const { candidatosPara, mainDeSets } = require('../controllers/startggController');

test('el gamerTag idéntico gana aunque otro haya jugado más torneos; el prefijo del ranking se ignora', () => {
    const jugadores = [
        { player_id: '1', gamerTag: 'emanuel', torneos: 20 },
        { player_id: '2', gamerTag: 'Eman', torneos: 3 },
        { player_id: '3', gamerTag: 'Otro', torneos: 50 },
    ];
    const r = candidatosPara('CG | EMAN', jugadores);
    assert.deepEqual(r.map((j) => j.player_id), ['2', '1']);
    assert.equal(r[0].exacto, true);
    assert.deepEqual(candidatosPara('x', jugadores), []);
});


test('el main es el personaje más usado en Ultimate, sin contar otros juegos, Random ni al rival', () => {
    const ult = { videogame: { id: 1386 } };
    const sel = (id, nombre) => ({ entrant: { participants: [{ player: { id } }] }, character: nombre ? { name: nombre } : null });
    const jugador = { id: 9, sets: { nodes: [
        { event: ult, games: [{ selections: [sel(9, 'Pikachu'), sel(5, 'Fox')] }, { selections: [sel(9, 'Pikachu'), sel(5, 'Fox')] }] },
        { event: ult, games: [{ selections: [sel(9, 'Random Character'), sel(5, 'Fox')] }, { selections: [sel(9, 'Pichu'), sel(5, null)] }] },
        { event: { videogame: { id: 43868 } }, games: [1, 2, 3].map(() => ({ selections: [sel(9, 'Ken')] })) },
    ] } };
    assert.deepEqual(mainDeSets(jugador), { personaje: 'Pikachu', partidas: 2 });
    assert.equal(mainDeSets({ id: 1, sets: { nodes: [] } }), null);
});
