import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { agruparTorneos, cajaDepartamento, departamentoDe } from './mapa.js';
import { VISTA } from './proyeccion.js';
const geojson = JSON.parse(readFileSync(new URL('../../public/guatemala.geojson', import.meta.url)));

test('ubica torneos por coordenadas reales y descarta puntos fuera del país', () => {
    assert.equal(departamentoDe({ lat: 14.6417, lng: -90.5133 }, geojson), 'Guatemala');
    assert.equal(departamentoDe({ lat: 14.8552, lng: -91.5218 }, geojson), 'Quetzaltenango');
    assert.equal(departamentoDe({ lat: 0, lng: 0 }, geojson), null);
    assert.equal(departamentoDe({ lat: null, lng: null }, geojson), null);
    assert.equal(departamentoDe({ lat: 'no válido', lng: -90 }, geojson), null);
});
test('los encuadres departamentales permanecen dentro de la proyección', () => {
    for (const feature of geojson.features) {
        const caja = cajaDepartamento(feature);
        assert.ok(caja.ancho > 0 && caja.alto > 0);
        assert.ok(caja.x >= 0 && caja.y >= 0);
        assert.ok(caja.x + caja.ancho <= VISTA.ancho);
        assert.ok(caja.y + caja.alto <= VISTA.alto);
    }
});
test('torneos en el mismo lugar se agrupan y al acercarse se pueden seleccionar por separado', () => {
    const ts = [1,2,3].map(id => ({ id, lugar: { lat: 14.6417, lng: -90.5133 } }));
    const lejos = agruparTorneos(ts, 1);
    assert.equal(lejos.length, 1);
    assert.equal(lejos[0].torneos.length, 3);
    const cerca = agruparTorneos(ts, 4);
    assert.equal(cerca.length, 3);
    assert.equal(new Set(cerca.map(p => `${p.x}:${p.y}`)).size, 3);
    assert.equal(agruparTorneos([{ lugar: {} }]).length, 0);
});
