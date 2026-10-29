import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aplicarTagsStartgg, armarJugadores, leerH2H, leerRanking, parseCsv, separarTeam } from './braacketCsv.js';

const RANKING = 'Rank,Player,Points,Country,Characters\r\n1,"ShinyMark",8802,"","Pikachu"\r\n2,"Janus | HaunterGV",8098,"","Pyra / Mythra - Steve"\r\n3,"Eman, ""el"" pro",7000,"","Ken - Ryu"\r\n';
const H2H = ',,"1","2","3",\n,,"ShinyMark","Janus | HaunterGV","Eman, ""el"" pro",\n"1","ShinyMark",--,15 -- 4,3 -- 0,\n"2","Janus | HaunterGV",4 -- 15,--,0 -- 0,\n"3","Eman, ""el"" pro",0 -- 3,0 -- 0,--,\n';

test('parseCsv respeta comillas dobles y comas dentro de comillas', () => {
    assert.deepEqual(parseCsv('a,"b, ""c"""\n'), [['a', 'b, "c"']]);
});

test('arma récord, rivales y main desde los CSV de Braacket', () => {
    const skinDe = (slug) => (['pikachu', 'ken', 'ryu'].includes(slug) ? `${slug}:0` : '');
    const [shiny, haunter, eman] = armarJugadores(leerRanking(RANKING), leerH2H(H2H), [], skinDe);
    assert.deepEqual(shiny.matches, { wins: 18, losses: 4, winRate: '82%' });
    assert.deepEqual(shiny.matchups.mostWon, { value: '15x', opponent: 'HaunterGV' });
    assert.equal(haunter.nombre, 'HaunterGV');
    assert.equal(haunter.team, 'Janus');
    assert.equal(shiny.team, null);
    assert.deepEqual(shiny.matchups.bestWinRate, { value: '100%', opponent: 'Eman, "el" pro' });
    assert.equal(shiny.skin, 'pikachu:0');
    assert.equal(haunter.skin, '', 'sin imagen para Pyra/Mythra ni Steve');
    assert.equal(eman.skin, 'ken:0');
    assert.deepEqual(haunter.h2h, [{ rival: 'ShinyMark', ganados: 4, perdidos: 15 }]);
    assert.equal(eman.puntos, 7000);
});

test('rechaza un head-to-head con otra cantidad o con otros jugadores', () => {
    const corto = ',,"1",\n,,"ShinyMark",\n"1","ShinyMark",--,\n';
    assert.throws(() => armarJugadores(leerRanking(RANKING), leerH2H(corto)), /tiene 1 jugadores y el ranking 3/);
    const otro = H2H.replaceAll('ShinyMark', 'Otro');
    assert.throws(() => armarJugadores(leerRanking(RANKING), leerH2H(otro)), /Faltan: ShinyMark\. No están en el ranking: Otro/);
});

test('conserva las ediciones guardadas del admin', () => {
    const [shiny] = armarJugadores(leerRanking(RANKING), new Map(), [{ nombre: 'shinymark', skin: 'pikachu:3', player_id: '184005' }], () => 'x:0');
    assert.equal(shiny.skin, 'pikachu:3');
    assert.equal(shiny.player_id, '184005');
});

test('separa el team del tag', () => {
    assert.deepEqual(separarTeam('Janus | HaunterGV'), { nombre: 'HaunterGV', team: 'Janus' });
    assert.deepEqual(separarTeam('MKG|Krlos04'), { nombre: 'Krlos04', team: 'MKG' });
    assert.deepEqual(separarTeam('Salamandra | GTX | Eman'), { nombre: 'Eman', team: 'Salamandra | GTX' });
    assert.deepEqual(separarTeam('ShinyMark'), { nombre: 'ShinyMark', team: null });
});

test('un team editado a mano gana sobre el del CSV y se reconoce al jugador guardado con el nombre viejo', () => {
    const [, haunter] = armarJugadores(leerRanking(RANKING), new Map(), [{ nombre: 'Janus | HaunterGV', team: 'Otro', player_id: '9' }]);
    assert.equal(haunter.team, 'Otro');
    assert.equal(haunter.player_id, '9');
});

test('aplicarTagsStartgg usa tag y prefijo de start.gg, renombra rivales y deja el CSV a quien no está', () => {
    const skinDe = () => '';
    const jugadores = armarJugadores(leerRanking(RANKING), leerH2H(H2H), [{ nombre: 'HaunterGV', player_id: '7' }], skinDe);
    const [shiny, haunter] = aplicarTagsStartgg(jugadores, [{ player_id: '7', gamerTag: 'Haunter', prefijo: null }]);
    assert.equal(haunter.nombre, 'Haunter');
    assert.equal(haunter.team, null);
    assert.equal(shiny.nombre, 'ShinyMark');
    assert.equal(shiny.matchups.mostWon.opponent, 'Haunter');
    assert.ok(shiny.h2h.some((r) => r.rival === 'Haunter'));
});
