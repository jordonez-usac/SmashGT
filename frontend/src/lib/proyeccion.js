export const BBOX = { lngMin: -92.4, lngMax: -88.1, latMin: 13.6, latMax: 17.9 };

const ANCHO_GRADOS = BBOX.lngMax - BBOX.lngMin;
const ALTO_GRADOS = BBOX.latMax - BBOX.latMin;
const COS_LAT = Math.cos((((BBOX.latMin + BBOX.latMax) / 2) * Math.PI) / 180);

export const VISTA = { ancho: 1000, alto: Math.round(1000 * (ALTO_GRADOS / (ANCHO_GRADOS * COS_LAT))) };

export const proyectar = (lng, lat) => ({
    x: ((lng - BBOX.lngMin) / ANCHO_GRADOS) * VISTA.ancho,
    y: ((BBOX.latMax - lat) / ALTO_GRADOS) * VISTA.alto
});

export const desproyectar = (x, y) => ({
    lng: (x / VISTA.ancho) * ANCHO_GRADOS + BBOX.lngMin,
    lat: BBOX.latMax - (y / VISTA.alto) * ALTO_GRADOS
});

export const colorDepartamento = (i, resaltado = false) =>
    `hsl(${174 + (i % 5) * 3} ${resaltado ? 45 : 28}% ${resaltado ? 43 : 30 + i * .38}%)`;

export const aPaths = (geojson) =>
    geojson.features.map((feature, i) => ({
        nombre: feature.properties.nombre,
        color: colorDepartamento(i),
        colorResaltado: colorDepartamento(i, true),
        d: feature.geometry.coordinates
            .map((poligono) =>
                poligono
                    .map((anillo) => {
                        const puntos = anillo.map(([lng, lat]) => {
                            const { x, y } = proyectar(lng, lat);
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                        });
                        return `M${puntos.join('L')}Z`;
                    })
                    .join('')
            )
            .join('')
    }));

export const distribuir = (torneos) => {
    const grupos = new Map();

    torneos
        .filter((t) => t.lugar?.lat != null && t.lugar?.lng != null)
        .forEach((torneo) => {
            const { x, y } = proyectar(torneo.lugar.lng, torneo.lugar.lat);
            const llave = `${Math.round(x / 18)}:${Math.round(y / 18)}`;
            if (!grupos.has(llave)) grupos.set(llave, []);
            grupos.get(llave).push({ torneo, x, y });
        });

    return [...grupos.values()].flatMap((grupo) =>
        grupo.map((marca, i) => {
            if (grupo.length === 1) return marca;
            const angulo = (i / grupo.length) * Math.PI * 2;
            const radio = 15 + grupo.length;
            return { ...marca, x: marca.x + Math.cos(angulo) * radio, y: marca.y + Math.sin(angulo) * radio };
        })
    );
};
