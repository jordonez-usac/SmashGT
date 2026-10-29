import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG_INICIAL, estadoSet, ordenStrikes } from './baneo.js';

test('el striking sigue el patrón 1-2-1 con 5 iniciales y 1-2-2-1 con 7', () => {
    assert.deepEqual(ordenStrikes(5, 0), [0, 1, 1, 0]);
    assert.deepEqual(ordenStrikes(7, 1), [1, 0, 0, 1, 1, 0]);
});

test('un set al mejor de 3 con striking, baneos del ganador y DSR', () => {
    const acciones = [{ tipo: 'primero', jugador: 0 }];
    const quitar = escenario => acciones.push({ tipo: 'quitar', escenario });

    assert.equal(estadoSet(CONFIG_INICIAL, acciones).turno, 0);
    quitar('final-destination');
    const s = estadoSet(CONFIG_INICIAL, acciones);
    assert.deepEqual([s.fase, s.turno, s.pendientes], ['strike', 1, 2]);
    quitar('battlefield'); quitar('small-battlefield'); quitar('town-and-city');
    assert.deepEqual([estadoSet(CONFIG_INICIAL, acciones).fase, estadoSet(CONFIG_INICIAL, acciones).escenario], ['jugando', 'pokemon-stadium-2']);

    acciones.push({ tipo: 'ganador', jugador: 1 });
    let g2 = estadoSet(CONFIG_INICIAL, acciones);
    assert.deepEqual([g2.juego, g2.fase, g2.turno, g2.pendientes], [2, 'ban', 1, 3]);
    quitar('battlefield'); quitar('smashville'); quitar('kalos-pokemon-league');
    g2 = estadoSet(CONFIG_INICIAL, acciones);
    assert.deepEqual([g2.fase, g2.turno, g2.bloqueados], ['pick', 0, []]);
    acciones.push({ tipo: 'elegir', escenario: 'final-destination' }, { tipo: 'ganador', jugador: 0 });

    const g3 = estadoSet(CONFIG_INICIAL, [...acciones, { tipo: 'quitar', escenario: 'battlefield' }, { tipo: 'quitar', escenario: 'smashville' }, { tipo: 'quitar', escenario: 'hollow-bastion' }]);
    assert.deepEqual([g3.fase, g3.turno, g3.bloqueados], ['pick', 1, ['pokemon-stadium-2']]);

    const fin = estadoSet(CONFIG_INICIAL, [...acciones, { tipo: 'quitar', escenario: 'a' }, { tipo: 'quitar', escenario: 'b' }, { tipo: 'quitar', escenario: 'c' }, { tipo: 'elegir', escenario: 'smashville' }, { tipo: 'ganador', jugador: 0 }]);
    assert.deepEqual([fin.fase, fin.campeon, fin.marcador], ['fin', 0, [2, 1]]);
});
