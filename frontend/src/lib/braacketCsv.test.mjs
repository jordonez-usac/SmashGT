import { test } from 'node:test';
import assert from 'node:assert/strict';
import { armarJugadores, leerH2H, leerRanking, parseCsv } from './braacketCsv.js';

const RANKING = 'Rank,Player,Points,Country,Characters\r\n1,"ShinyMark",8802,"","Pikachu"\r\n2,"Janus | HaunterGV",8098,"","Pyra / Mythra - Steve"\r\n3,"Eman, ""el"" pro",7000,"","Ken - Ryu"\r\n';
const H2H = ',,"1","2","3",\n,,"ShinyMark","Janus | HaunterGV","Eman, ""el"" pro",\n"1","ShinyMark",--,15 -- 4,3 -- 0,\n"2","Janus | HaunterGV",4 -- 15,--,0 -- 0,\n"3","Eman, ""el"" pro",0 -- 3,0 -- 0,--,\n';

test('parseCsv respeta comillas dobles y comas dentro de comillas', () => {
    assert.deepEqual(parseCsv('a,"b, ""c"""\n'), [['a', 'b, "c"']]);
});

test('arma récord, rivales y main desde los CSV de Braacket', () => {
    const skinDe = (slug) => (['pikachu', 'ken', 'ryu'].includes(slug) ? `${slug}:0` : '');
    const [shiny, haunter, eman] = armarJugadores(leerRanking(RANKING), leerH2H(H2H), [], skinDe);
    assert.deepEqual(shiny.matches, { wins: 18, losses: 4, winRate: '82%' });
    assert.deepEqual(shiny.matchups.mostWon, { value: '15x', opponent: 'Janus | HaunterGV' });
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
