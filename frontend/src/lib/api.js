const BASE = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'smashgt_token';

export const guardarToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const leerToken = () => localStorage.getItem(TOKEN_KEY);
export const borrarToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
    constructor(mensaje, status, datos = {}) {
        super(mensaje);
        this.status = status;
        this.datos = datos;
    }
}

const request = async (ruta, { method = 'GET', body, auth = false } = {}) => {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    if (auth) {
        const token = leerToken();
        if (!token) throw new ApiError('No hay sesión activa, inicia sesión primero', 401);
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${ruta}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const texto = await res.text();
    let data;
    try {
        data = texto ? JSON.parse(texto) : {};
    } catch {
        throw new ApiError(`Respuesta no-JSON del servidor (${res.status}): ${texto.slice(0, 120)}`, res.status);
    }

    if (!res.ok) {
        throw new ApiError(data.msg || data.error || `Error ${res.status}`, res.status, data);
    }

    return data;
};

export const api = {
    login: (email, password) =>
        request('/auth/login', { method: 'POST', body: { email, password } }),

    solicitarRegistro: (nombre, email, motivo) =>
        request('/auth/solicitar', { method: 'POST', body: { nombre, email, motivo } }),

    cambiarPassword: (passwordActual, nuevaPassword) =>
        request('/auth/cambiar-password', {
            method: 'PUT',
            body: { passwordActual, nuevaPassword },
            auth: true,
        }),

    yo: () => request('/auth/yo', { auth: true }),

    listarSolicitudes: () => request('/auth/solicitudes', { auth: true }),

    obtenerSolicitud: (id) => request(`/auth/solicitudes/${id}`, { auth: true }),

    responderSolicitud: (id, accion) =>
        request(`/auth/solicitudes/${id}/responder`, { method: 'POST', body: { accion }, auth: true }),

    listarRankings: () => request('/rankings'),

    obtenerRanking: (id) => request(`/rankings/${id}`),

    listarJugadores: () => request('/rankings/jugadores'),

    rankingActual: async () => {
        const lista = await request('/rankings');
        return lista.length ? request(`/rankings/${lista[0]._id}`) : null;
    },

    crearRanking: (ranking) =>
        request('/rankings', { method: 'POST', body: ranking, auth: true }),

    actualizarRanking: (id, ranking) =>
        request(`/rankings/${id}`, { method: 'PUT', body: ranking, auth: true }),

    eliminarRanking: (id) =>
        request(`/rankings/${id}`, { method: 'DELETE', auth: true }),

    resolverJugadorStartgg: (identificador) =>
        request(`/jugadores/resolver/${encodeURIComponent(identificador)}`, { auth: true }),

    detectarMainStartgg: (playerId) =>
        request(`/jugadores/main/${encodeURIComponent(playerId)}`, { auth: true }),

    buscarJugadoresStartgg: (nombres) =>
        request('/jugadores/buscar', { method: 'POST', body: { nombres }, auth: true }),

    tagsStartgg: (ids) =>
        request('/jugadores/tags', { method: 'POST', body: { ids }, auth: true }),

    obtenerJugador: (identificador) => request(`/jugadores/${encodeURIComponent(identificador)}`),

    listarTorneos: () => request('/torneos'),

    listarResultados: () => request('/torneos/resultados'),

    listarTorneosManuales: () => request('/torneos/manuales', { auth: true }),

    crearTorneo: (torneo) => request('/torneos', { method: 'POST', body: torneo, auth: true }),

    actualizarTorneo: (id, torneo) =>
        request(`/torneos/${id}`, { method: 'PUT', body: torneo, auth: true }),

    eliminarTorneo: (id) => request(`/torneos/${id}`, { method: 'DELETE', auth: true }),

    listarNoticias: () => request('/news'),

    obtenerNoticia: (id) => request(`/news/${id}`),

    crearNoticia: (noticia) =>
        request('/news', { method: 'POST', body: noticia, auth: true }),

    actualizarNoticia: (id, noticia) =>
        request(`/news/${id}`, { method: 'PUT', body: noticia, auth: true }),

    eliminarNoticia: (id) =>
        request(`/news/${id}`, { method: 'DELETE', auth: true }),

    darLike: (id) => request(`/news/${id}/like`, { method: 'POST' }),
};
