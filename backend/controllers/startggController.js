const Ranking = require('../models/Ranking');

const API = 'https://api.start.gg/gql/alpha';
const JUEGO_SMASH_ULTIMATE = 1386;
const LIMITE_STANDINGS = 20;
const PAIS = 'GT';
const TTL_CACHE = 10 * 60 * 1000;

const cache = new Map();

const leerCache = (llave) => {
    const guardado = cache.get(llave);
    if (!guardado) return null;
    if (Date.now() - guardado.momento > TTL_CACHE) {
        cache.delete(llave);
        return null;
    }
    return guardado.datos;
};

const guardarCache = (llave, datos) => {
    if (cache.size > 500) cache.clear();
    cache.set(llave, { momento: Date.now(), datos });
};

const normalizarIdentificador = (valor) => {
    const limpio = String(valor || '').trim().replace(/^https?:\/\/(www\.)?(start\.gg|smash\.gg)\//i, '');
    if (!/^(user\/)?[a-z0-9-]{1,60}$/i.test(limpio)) return null;
    return limpio.replace(/^user\//i, '');
};

const CAMPOS_JUGADOR = `
    id
    gamerTag
    prefix
    recentStandings(videogameId: $juego, limit: $limite) {
        placement
        container {
            ... on Event {
                id
                name
                numEntrants
                startAt
                tournament {
                    id
                    name
                    slug
                    countryCode
                    city
                    startAt
                    numAttendees
                    images { type url }
                }
            }
        }
    }`;

const CAMPOS_USUARIO = `
    id
    slug
    name
    bio
    genderPronoun
    location { city state country }
    images { type url }`;

const CONSULTA_POR_ID = `query PerfilPorId($valor: ID!, $juego: ID!, $limite: Int!) {
    player(id: $valor) { ${CAMPOS_JUGADOR} user { ${CAMPOS_USUARIO} } }
}`;

const CONSULTA_POR_SLUG = `query PerfilPorSlug($valor: String!, $juego: ID!, $limite: Int!) {
    user(slug: $valor) { ${CAMPOS_USUARIO} player { ${CAMPOS_JUGADOR} } }
}`;

const CONSULTA_TORNEOS = `query TorneosGT($desde: Timestamp!, $juego: ID!) {
    tournaments(query: {
        perPage: 40,
        page: 1,
        sortBy: "startAt asc",
        filter: { countryCode: "GT", afterDate: $desde, videogameIds: [$juego] }
    }) {
        nodes {
            id
            name
            slug
            startAt
            endAt
            lat
            lng
            venueName
            venueAddress
            city
            numAttendees
            isRegistrationOpen
            images { type url }
        }
    }
}`;

const DIAS_ATRAS = 30;

const torneosDeGuatemala = async () => {
    const desde = Math.floor((Date.now() - DIAS_ATRAS * 24 * 60 * 60 * 1000) / 1000);
    const llave = 'torneos:guatemala';
    const enCache = leerCache(llave);
    if (enCache) return enCache;

    const data = await consultar(CONSULTA_TORNEOS, desde, { desde, juego: JUEGO_SMASH_ULTIMATE });

    const torneos = (data.tournaments?.nodes || [])
        .filter((t) => t.lat && t.lng)
        .map((t) => ({
            id: `startgg-${t.id}`,
            fuente: 'startgg',
            nombre: t.name,
            descripcion: '',
            url: `https://start.gg/${t.slug}`,
            imagen: imagen(t.images, 'profile') || imagen(t.images, 'banner'),
            fecha: t.startAt ? t.startAt * 1000 : null,
            fecha_fin: t.endAt ? t.endAt * 1000 : null,
            lugar: {
                nombre: t.venueName || '',
                direccion: t.venueAddress || '',
                ciudad: t.city || '',
                lat: t.lat,
                lng: t.lng
            },
            asistentes: t.numAttendees,
            inscripcion_abierta: t.isRegistrationOpen,
            slug: t.slug
        }));

    guardarCache(llave, torneos);
    return torneos;
};

const CONSULTA_RESULTADOS = `query ResultadosGT($antes: Timestamp!, $desde: Timestamp!, $juego: ID!) {
    tournaments(query: {
        perPage: 12,
        page: 1,
        sortBy: "startAt desc",
        filter: { countryCode: "GT", beforeDate: $antes, afterDate: $desde, videogameIds: [$juego] }
    }) {
        nodes {
            id
            name
            slug
            startAt
            city
            numAttendees
            images { type url }
            events(filter: { videogameId: [$juego] }) {
                id
                name
                slug
                numEntrants
                standings(query: { perPage: 8, page: 1 }) {
                    nodes { placement entrant { name participants { player { id } } } }
                }
            }
        }
    }
}`;

const DIAS_RESULTADOS = 365;

const armarResultado = (t) => {
    const eventos = (t.events || [])
        .filter((e) => e.standings?.nodes?.length)
        .sort((a, b) => (b.numEntrants || 0) - (a.numEntrants || 0))
        .map((e) => ({
            id: e.id,
            nombre: e.name,
            url: `https://start.gg/${e.slug}`,
            entrantes: e.numEntrants,
            top: e.standings.nodes.map((s) => ({
                puesto: s.placement,
                nombre: s.entrant?.name || '',
                player_id: s.entrant?.participants?.length === 1 ? String(s.entrant.participants[0].player?.id || '') || null : null
            }))
        }));
    return {
        id: `startgg-${t.id}`,
        nombre: t.name,
        url: `https://start.gg/${t.slug}`,
        fecha: t.startAt ? t.startAt * 1000 : null,
        ciudad: t.city || '',
        asistentes: t.numAttendees,
        imagen: imagen(t.images, 'profile') || imagen(t.images, 'banner'),
        eventos
    };
};

const resultadosDeGuatemala = async () => {
    const llave = 'resultados:guatemala';
    const enCache = leerCache(llave);
    if (enCache) return enCache;

    const antes = Math.floor(Date.now() / 1000);
    const desde = antes - DIAS_RESULTADOS * 24 * 60 * 60;
    const data = await consultar(CONSULTA_RESULTADOS, null, { antes, desde, juego: JUEGO_SMASH_ULTIMATE });
    const resultados = (data.tournaments?.nodes || []).map(armarResultado).filter((t) => t.eventos.length);

    guardarCache(llave, resultados);
    return resultados;
};

exports.listarResultados = async (req, res) => {
    if (!process.env.STARTGG_API_KEY) {
        return res.status(503).json({ msg: 'El servidor no tiene configurada STARTGG_API_KEY' });
    }
    try {
        res.json(await resultadosDeGuatemala());
    } catch (error) {
        console.log('Error trayendo resultados de start.gg:', error.message);
        res.status(502).json({ msg: 'No se pudieron traer los resultados de start.gg' });
    }
};

const CONSULTA_RESOLVER_SLUG = `query ResolverSlug($valor: String!) {
    user(slug: $valor) { slug images { type url } player { id gamerTag prefix } }
}`;

const CONSULTA_RESOLVER_ID = `query ResolverId($valor: ID!) {
    player(id: $valor) { id gamerTag prefix user { slug images { type url } } }
}`;

const consultar = async (query, valor, variablesExtra = null) => {
    const respuesta = await fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.STARTGG_API_KEY}`
        },
        body: JSON.stringify({
            query,
            variables: variablesExtra
                || (query.includes('$juego')
                    ? { valor, juego: JUEGO_SMASH_ULTIMATE, limite: LIMITE_STANDINGS }
                    : { valor })
        }),
        signal: AbortSignal.timeout(15000)
    });

    if (!respuesta.ok) {
        throw new Error(`start.gg respondió ${respuesta.status}`);
    }

    const cuerpo = await respuesta.json();
    if (cuerpo.errors?.length) throw new Error(cuerpo.errors[0].message);
    return cuerpo.data;
};

const imagen = (imagenes, tipo) => imagenes?.find((i) => i.type === tipo)?.url || null;

const armarTorneo = ({ placement, container }) => {
    const torneo = container?.tournament;
    if (!torneo) return null;
    return {
        id: torneo.id,
        nombre: torneo.name,
        url: `https://start.gg/${torneo.slug}`,
        ciudad: torneo.city,
        pais: torneo.countryCode,
        fecha: torneo.startAt ? torneo.startAt * 1000 : null,
        asistentes: torneo.numAttendees,
        imagen: imagen(torneo.images, 'profile') || imagen(torneo.images, 'banner'),
        evento: container.name,
        entrantes: container.numEntrants,
        placement
    };
};

const normalizarPerfil = (jugador, usuario) => {
    const standings = jugador?.recentStandings || [];
    const torneos = standings.map(armarTorneo).filter(Boolean);
    const deGuatemala = torneos.filter((t) => t.pais === PAIS);

    return {
        player_id: jugador?.id || null,
        gamerTag: jugador?.gamerTag || null,
        prefijo: jugador?.prefix || null,
        nombre: usuario?.name || null,
        bio: usuario?.bio || null,
        pronombre: usuario?.genderPronoun || null,
        ubicacion: [usuario?.location?.city, usuario?.location?.state, usuario?.location?.country]
            .filter(Boolean)
            .join(', ') || null,
        avatar: imagen(usuario?.images, 'profile'),
        banner: imagen(usuario?.images, 'banner'),
        url_perfil: usuario?.slug ? `https://start.gg/${usuario.slug}` : null,
        torneos: torneos.map((t) => ({ ...t, en_guatemala: t.pais === PAIS })),
        torneos_en_guatemala: deGuatemala.length
    };
};

const obtenerPerfilStartgg = async (identificador) => {
    const enCache = leerCache(identificador);
    if (enCache) return enCache;

    const esNumerico = /^\d+$/.test(identificador);
    const data = await consultar(esNumerico ? CONSULTA_POR_ID : CONSULTA_POR_SLUG, identificador);

    const jugador = esNumerico ? data.player : data.user?.player;
    const usuario = esNumerico ? data.player?.user : data.user;
    if (!jugador && !usuario) return null;

    const perfil = normalizarPerfil(jugador, usuario);
    guardarCache(identificador, perfil);
    return perfil;
};

const buscarEnRankings = async (valores) => {
    const ranking = await Ranking.findOne({ 'jugadores.player_id': { $in: valores } })
        .sort({ createdAt: -1 })
        .lean();
    if (!ranking) return null;

    const jugador = ranking.jugadores.find((j) => valores.includes(j.player_id));
    return { ranking: { _id: ranking._id, titulo: ranking.titulo }, jugador };
};

const sinPrefijo = (nombre) => String(nombre || '').split('|').pop().trim().toLowerCase();
const buscarPorTag = async (gamerTag) => {
    if (!gamerTag) return null;
    const ranking = await Ranking.findOne().sort({ createdAt: -1 }).lean();
    const jugador = ranking?.jugadores.find((j) => sinPrefijo(j.nombre) === sinPrefijo(gamerTag));
    return jugador ? { ranking: { _id: ranking._id, titulo: ranking.titulo }, jugador } : null;
};

exports.obtenerJugador = async (req, res) => {
    const identificador = normalizarIdentificador(req.params.identificador);
    if (!identificador) {
        return res.status(400).json({ msg: 'Identificador de start.gg inválido' });
    }

    try {
        const [startgg, local] = await Promise.allSettled([
            process.env.STARTGG_API_KEY
                ? obtenerPerfilStartgg(identificador)
                : Promise.reject(new Error('start.gg no está configurado')), 
            buscarEnRankings([...new Set([req.params.identificador, identificador])])
        ]);

        if (local.status === 'rejected') throw local.reason;
        if (startgg.status === 'rejected') {
            console.log('Error consultando start.gg:', startgg.reason.message);
        }

        if (!local.value && startgg.value?.gamerTag) local.value = await buscarPorTag(startgg.value.gamerTag);

        if (startgg.value === null && local.value === null) {
            return res.status(404).json({ msg: 'No se encontró a ese jugador' });
        }

        res.json({
            identificador,
            startgg: startgg.status === 'fulfilled' ? startgg.value : null,
            error_startgg: startgg.status === 'rejected' ? 'No se pudo consultar start.gg' : null,
            local: local.value
        });
    } catch (error) {
        console.log('Error al obtener el jugador:', error);
        res.status(500).json({ msg: 'Error al obtener el jugador', error: error.message });
    }
};

exports.resolverJugador = async (req, res) => {
    const identificador = normalizarIdentificador(req.params.identificador);
    if (!identificador) {
        return res.status(400).json({ msg: 'Identificador de start.gg inválido' });
    }

    if (!process.env.STARTGG_API_KEY) {
        return res.status(503).json({ msg: 'El servidor no tiene configurada STARTGG_API_KEY' });
    }

    try {
        const llave = `resolver:${identificador}`;
        const enCache = leerCache(llave);
        if (enCache) return res.json(enCache);

        const esNumerico = /^\d+$/.test(identificador);
        const data = await consultar(
            esNumerico ? CONSULTA_RESOLVER_ID : CONSULTA_RESOLVER_SLUG,
            identificador
        );

        const jugador = esNumerico ? data.player : data.user?.player;
        const usuario = esNumerico ? data.player?.user : data.user;

        if (!jugador?.id) {
            return res.status(404).json({
                msg: usuario
                    ? 'Ese usuario de start.gg no tiene un jugador asociado'
                    : 'No existe ese usuario en start.gg'
            });
        }

        const resuelto = {
            player_id: String(jugador.id),
            gamerTag: jugador.gamerTag || null,
            prefijo: jugador.prefix || null,
            avatar: imagen(usuario?.images, 'profile'),
            url_perfil: usuario?.slug ? `https://start.gg/${usuario.slug}` : null
        };

        guardarCache(llave, resuelto);
        res.json(resuelto);
    } catch (error) {
        console.log('Error al resolver el jugador en start.gg:', error.message);
        res.status(502).json({ msg: 'No se pudo consultar start.gg' });
    }
};

const CONSULTA_PARTICIPANTES = `query ParticipantesGT($desde: Timestamp!, $juego: ID!, $pagina: Int!) {
    tournaments(query: {
        perPage: 8,
        page: $pagina,
        sortBy: "startAt desc",
        filter: { countryCode: "GT", afterDate: $desde, videogameIds: [$juego] }
    }) {
        pageInfo { totalPages }
        nodes { participants(query: { perPage: 200, page: 1 }) { nodes { player { id gamerTag prefix } } } }
    }
}`;

const TTL_INDICE = 60 * 60 * 1000;
let indice = null;

const indiceParticipantes = async () => {
    if (indice && Date.now() - indice.momento < TTL_INDICE) return indice.jugadores;
    const desde = Math.floor((Date.now() - DIAS_RESULTADOS * 24 * 60 * 60 * 1000) / 1000);
    const jugadores = new Map();
    for (let pagina = 1, total = 1; pagina <= total && pagina <= 20; pagina++) {
        const data = await consultar(CONSULTA_PARTICIPANTES, null, { desde, juego: JUEGO_SMASH_ULTIMATE, pagina });
        total = data.tournaments?.pageInfo?.totalPages || 0;
        for (const torneo of data.tournaments?.nodes || []) {
            for (const { player } of torneo.participants?.nodes || []) {
                if (!player?.id) continue;
                const previo = jugadores.get(player.id);
                jugadores.set(player.id, {
                    player_id: String(player.id),
                    gamerTag: player.gamerTag,
                    prefijo: player.prefix || null,
                    torneos: (previo?.torneos || 0) + 1
                });
            }
        }
    }
    indice = { momento: Date.now(), jugadores: [...jugadores.values()] };
    return indice.jugadores;
};

const normalizarTag = (nombre) => sinPrefijo(nombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

const candidatosPara = (nombre, jugadores) => {
    const clave = normalizarTag(nombre);
    if (clave.length < 2) return [];
    return jugadores
        .map((j) => ({ ...j, exacto: normalizarTag(j.gamerTag) === clave }))
        .filter((j) => j.exacto || normalizarTag(j.gamerTag).includes(clave))
        .sort((a, b) => b.exacto - a.exacto || b.torneos - a.torneos)
        .slice(0, 3);
};

exports.buscarJugadores = async (req, res) => {
    const nombres = req.body?.nombres;
    if (!Array.isArray(nombres) || nombres.length > 200 || !nombres.every((n) => typeof n === 'string' && n.length <= 100)) {
        return res.status(400).json({ msg: 'Manda "nombres": una lista de hasta 200 nombres' });
    }
    if (!process.env.STARTGG_API_KEY) {
        return res.status(503).json({ msg: 'El servidor no tiene configurada STARTGG_API_KEY' });
    }
    try {
        const jugadores = await indiceParticipantes();
        res.json(nombres.map((nombre) => ({ nombre, candidatos: candidatosPara(nombre, jugadores) })));
    } catch (error) {
        console.log('Error buscando jugadores en start.gg:', error.message);
        res.status(502).json({ msg: 'No se pudo consultar start.gg' });
    }
};

const CONSULTA_SETS = `query SetsJugador($valor: ID!) {
    player(id: $valor) { id sets(perPage: 25, page: 1) { nodes { event { videogame { id } } games { selections { entrant { participants { player { id } } } character { name } } } } } }
}`;

const mainDeSets = (jugador) => {
    const conteo = new Map();
    for (const set of jugador?.sets?.nodes || []) {
        if (Number(set.event?.videogame?.id) !== JUEGO_SMASH_ULTIMATE) continue;
        for (const game of set.games || []) {
            for (const sel of game.selections || []) {
                const nombre = sel.character?.name;
                const esSuyo = sel.entrant?.participants?.some((p) => String(p.player?.id) === String(jugador.id));
                if (esSuyo && nombre && nombre !== 'Random Character') conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
            }
        }
    }
    const [personaje, partidas] = [...conteo].sort((a, b) => b[1] - a[1])[0] || [];
    return personaje ? { personaje, partidas } : null;
};

exports.detectarMain = async (req, res) => {
    const id = String(req.params.id || '');
    if (!/^\d{1,12}$/.test(id)) return res.status(400).json({ msg: 'El player_id debe ser numérico' });
    if (!process.env.STARTGG_API_KEY) {
        return res.status(503).json({ msg: 'El servidor no tiene configurada STARTGG_API_KEY' });
    }
    try {
        const llave = `main:${id}`;
        let main = leerCache(llave);
        if (main === null) {
            const data = await consultar(CONSULTA_SETS, id);
            if (!data.player) return res.status(404).json({ msg: 'No existe ese jugador en start.gg' });
            main = mainDeSets(data.player) || false;
            guardarCache(llave, main);
        }
        res.json({ main: main || null });
    } catch (error) {
        console.log('Error detectando el main en start.gg:', error.message);
        res.status(502).json({ msg: 'No se pudo consultar start.gg' });
    }
};

exports.mainDeSets = mainDeSets;
exports.candidatosPara = candidatosPara;
exports.obtenerPerfilStartgg = obtenerPerfilStartgg;
exports.torneosDeGuatemala = torneosDeGuatemala;
exports.armarResultado = armarResultado;
exports.normalizarIdentificador = normalizarIdentificador;
