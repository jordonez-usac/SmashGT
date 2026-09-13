import { proyectar } from './proyeccion.js';

const enAnillo = ([lng, lat], anillo) => {
    let dentro = false;
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
        const [xi, yi] = anillo[i];
        const [xj, yj] = anillo[j];
        if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
};

export const departamentoDe = (lugar, geojson) => {
    if (!Number.isFinite(Number(lugar?.lat)) || !Number.isFinite(Number(lugar?.lng)) || lugar?.lat == null || lugar?.lng == null) return null;
    const punto = [Number(lugar.lng), Number(lugar.lat)];
    return geojson?.features.find((f) => f.geometry.coordinates.some((p) => enAnillo(punto, p[0]) && !p.slice(1).some((a) => enAnillo(punto, a))))?.properties.nombre || null;
};

export const cajaDepartamento = (feature) => {
    const puntos = feature.geometry.coordinates.flat(2).map(([lng, lat]) => proyectar(lng, lat));
    const xs = puntos.map(p => p.x), ys = puntos.map(p => p.y);
    const x = Math.min(...xs), y = Math.min(...ys);
    return { x, y, ancho: Math.max(...xs) - x, alto: Math.max(...ys) - y };
};

export const agruparTorneos = (torneos, escala = 1, factorPantalla = 1) => {
    const grupos = [];
    for (const torneo of torneos) {
        if (torneo.lugar?.lat == null || torneo.lugar?.lng == null) continue;
        const punto = proyectar(Number(torneo.lugar.lng), Number(torneo.lugar.lat));
        if (!Number.isFinite(punto.x) || !Number.isFinite(punto.y)) continue;
        const grupo = grupos.find(g => Math.hypot(g.x - punto.x, g.y - punto.y) < 44 / (escala * factorPantalla));
        if (grupo) {
            grupo.torneos.push(torneo);
            const n = grupo.torneos.length;
            grupo.x += (punto.x - grupo.x) / n;
            grupo.y += (punto.y - grupo.y) / n;
        } else grupos.push({ ...punto, torneos: [torneo] });
    }
    return grupos.flatMap(g => escala < 3.5 || g.torneos.length === 1 ? [g] : g.torneos.map((torneo, i) => ({
        x: g.x + Math.cos(i / g.torneos.length * Math.PI * 2) * (26 + g.torneos.length * 2) / (escala * factorPantalla),
        y: g.y + Math.sin(i / g.torneos.length * Math.PI * 2) * (26 + g.torneos.length * 2) / (escala * factorPantalla),
        torneos: [torneo]
    })));
};

let promesa;
export const cargarGeografia = () => {
    if (!promesa) promesa = fetch('/guatemala.geojson').then(r => {
        if (!r.ok) throw new Error('No se pudo cargar el mapa. Vuelve a intentar.');
        return r.json();
    }).catch(e => { promesa = null; throw e; });
    return promesa;
};
