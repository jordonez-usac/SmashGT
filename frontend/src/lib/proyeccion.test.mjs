import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VISTA, aPaths, desproyectar, distribuir, proyectar } from './proyeccion.js';

const geojson = JSON.parse(readFileSync(new URL('../../public/guatemala.geojson', import.meta.url)));
const deptos = aPaths(geojson);

assert.equal(deptos.length, 22, 'faltan departamentos');
assert.equal(new Set(deptos.map((d) => d.color)).size, 22, 'hay departamentos con el mismo color');
for (const d of deptos) {
    assert.ok(d.d.startsWith('M') && d.d.endsWith('Z'), `${d.nombre} tiene un path mal formado`);
    assert.ok(!d.d.includes('NaN'), `${d.nombre} tiene coordenadas NaN`);
}

const numeros = deptos.flatMap((d) => d.d.split(/[MLZ]/).filter(Boolean).map((p) => p.split(',').map(Number)));
assert.ok(numeros.every(([x, y]) => x >= 0 && x <= VISTA.ancho && y >= 0 && y <= VISTA.alto), 'hay puntos fuera del viewBox');

for (const [lng, lat] of [[-90.5133, 14.6417], [-91.5218, 14.8552], [-89.3, 16.9]]) {
    const { x, y } = proyectar(lng, lat);
    const vuelta = desproyectar(x, y);
    assert.ok(Math.abs(vuelta.lat - lat) < 1e-9 && Math.abs(vuelta.lng - lng) < 1e-9, 'proyección no reversible');
}

const mismaDireccion = [1, 2, 3].map((i) => ({
    id: `t${i}`,
    fuente: 'manual',
    lugar: { lat: 14.6417, lng: -90.5133 }
}));
const marcas = distribuir(mismaDireccion);
assert.equal(marcas.length, 3);
for (let i = 0; i < marcas.length; i++) {
    for (let j = i + 1; j < marcas.length; j++) {
        const d = Math.hypot(marcas[i].x - marcas[j].x, marcas[i].y - marcas[j].y);
        assert.ok(d > 20, `dos pines quedaron a ${d.toFixed(1)} de distancia`);
    }
}

assert.equal(distribuir([{ id: 'x', lugar: {} }]).length, 0);

console.log(`ok: ${deptos.length} departamentos con color propio, viewBox ${VISTA.ancho}x${VISTA.alto}, proyección reversible, pines separados`);
