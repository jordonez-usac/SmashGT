const normalizarNombre = (nombre) => (nombre || "").trim().toLowerCase();

const llavesDeIdentidad = (jugador) => {
    const llaves = [];
    if (jugador.braacket_id) llaves.push(`braacket:${jugador.braacket_id}`);
    if (jugador.url_perfil) llaves.push(`url:${jugador.url_perfil}`);
    if (jugador.player_id) llaves.push(`startgg:${jugador.player_id}`);
    const nombre = normalizarNombre(jugador.nombre);
    if (nombre) llaves.push(`nombre:${nombre}`);
    return llaves;
};

const indexarPorIdentidad = (jugadores = []) => {
    const indice = new Map();
    jugadores.forEach((jugador) => {
        llavesDeIdentidad(jugador).forEach((llave) => {
            if (!indice.has(llave)) indice.set(llave, jugador);
        });
    });
    return indice;
};

const buscarExistente = (indice, jugadorNuevo) => {
    for (const llave of llavesDeIdentidad(jugadorNuevo)) {
        const encontrado = indice.get(llave);
        if (encontrado) return encontrado;
    }
    return null;
};

const tieneDatos = (valor) => {
    if (!valor || typeof valor !== 'object') return false;
    return Object.values(valor).some((v) => {
        if (v === null || v === undefined || v === "") return false;
        if (typeof v === 'object') return tieneDatos(v);
        return true;
    });
};

const mergeJugadores = (jugadoresGuardados = [], jugadoresNuevos = [], opciones = {}) => {
    const { prioridadEdiciones = 'nuevo', reemplazarH2H = false } = opciones;
    const indice = indexarPorIdentidad(jugadoresGuardados);

    return jugadoresNuevos.map((jugadorNuevo) => {
        const guardado = buscarExistente(indice, jugadorNuevo) || {};

        const preferido = prioridadEdiciones === 'guardado' ? guardado : jugadorNuevo;
        const alterno = prioridadEdiciones === 'guardado' ? jugadorNuevo : guardado;
        const editable = (campo) => (
            preferido[campo] !== undefined && preferido[campo] !== null && preferido[campo] !== ""
                ? preferido[campo]
                : alterno[campo]
        );

        return {
            puesto: editable('puesto'),
            nombre: editable('nombre'),
            team: editable('team') ?? null,
            skin: editable('skin') ?? "",
            player_id: editable('player_id') ?? "",
            braacket_id: jugadorNuevo.braacket_id || guardado.braacket_id || "",
            url_perfil: jugadorNuevo.url_perfil || guardado.url_perfil || "",
            puntos: jugadorNuevo.puntos ?? guardado.puntos ?? null,
            personajes: jugadorNuevo.personajes?.length ? jugadorNuevo.personajes : (guardado.personajes || []),
            h2h: reemplazarH2H || jugadorNuevo.h2h?.length ? (jugadorNuevo.h2h || []) : (guardado.h2h || []),
            matchups: reemplazarH2H || tieneDatos(jugadorNuevo.matchups) ? (jugadorNuevo.matchups || {}) : (guardado.matchups || {}),
            matches: reemplazarH2H || tieneDatos(jugadorNuevo.matches) ? (jugadorNuevo.matches || {}) : (guardado.matches || {})
        };
    });
};

// Recibe los rankings del más reciente al más viejo.
const unirJugadores = (rankings = []) => {
    const indice = new Map();
    const unidos = [];
    rankings.forEach((ranking) => {
        (ranking.jugadores || []).forEach((jugador) => {
            let unido = buscarExistente(indice, jugador);
            if (!unido) {
                unido = { nombre: jugador.nombre, team: null, skin: '', player_id: '', rankings: [] };
                unidos.push(unido);
            }
            ['team', 'skin', 'player_id'].forEach((campo) => { if (!unido[campo] && jugador[campo]) unido[campo] = jugador[campo]; });
            if (!unido.rankings.includes(ranking.titulo)) unido.rankings.push(ranking.titulo);
            llavesDeIdentidad(jugador).forEach((llave) => { if (!indice.has(llave)) indice.set(llave, unido); });
        });
    });
    return unidos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
};

module.exports = { mergeJugadores, tieneDatos, llavesDeIdentidad, unirJugadores };
