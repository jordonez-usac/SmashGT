export const parseCsv = (texto) => {
    const filas = [];
    let fila = [], celda = '', comillas = false;
    const limpio = String(texto).replace(/^﻿/, '');
    for (let i = 0; i < limpio.length; i++) {
        const c = limpio[i];
        if (comillas) {
            if (c === '"' && limpio[i + 1] === '"') { celda += '"'; i++; }
            else if (c === '"') comillas = false;
            else celda += c;
        } else if (c === '"') comillas = true;
        else if (c === ',') { fila.push(celda); celda = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && limpio[i + 1] === '\n') i++;
            fila.push(celda); filas.push(fila); fila = []; celda = '';
        } else celda += c;
    }
    if (celda || fila.length) { fila.push(celda); filas.push(fila); }
    return filas.filter((f) => f.some((c) => c.trim()));
};

export const slugDePersonaje = (nombre) => String(nombre).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const separarTeam = (texto) => {
    const partes = String(texto).split('|').map((p) => p.trim()).filter(Boolean);
    const nombre = partes.pop() || '';
    return { nombre, team: partes.join(' | ') || null };
};

export const leerRanking = (texto) => {
    const [encabezado, ...filas] = parseCsv(texto);
    const col = (nombre) => encabezado.findIndex((c) => c.trim().toLowerCase() === nombre);
    const [iRank, iPlayer, iPoints, iChars] = ['rank', 'player', 'points', 'characters'].map(col);
    if (iRank < 0 || iPlayer < 0) throw new Error('El CSV no parece un ranking de Braacket (faltan las columnas Rank y Player).');
    return filas
        .map((f) => ({
            puesto: parseInt(f[iRank], 10),
            nombre: (f[iPlayer] || '').trim(),
            puntos: iPoints >= 0 ? Number(f[iPoints]) || 0 : 0,
            personajes: iChars >= 0 ? (f[iChars] || '').split(' - ').map((p) => p.trim()).filter(Boolean) : [],
        }))
        .filter((j) => Number.isFinite(j.puesto) && j.nombre);
};

export const leerH2H = (texto) => {
    const filas = parseCsv(texto);
    const nombres = filas[1]?.slice(2).map((n) => n.trim()) || [];
    if (!nombres.length) throw new Error('El CSV no parece un head-to-head de Braacket.');
    const h2h = new Map();
    for (const fila of filas.slice(2)) {
        const jugador = (fila[1] || '').trim();
        if (!jugador) continue;
        const rivales = [];
        fila.slice(2).forEach((celda, i) => {
            const m = celda.match(/(\d+)\s*--\s*(\d+)/);
            if (m && nombres[i] && (+m[1] || +m[2])) rivales.push({ rival: nombres[i], ganados: +m[1], perdidos: +m[2] });
        });
        h2h.set(jugador, rivales);
    }
    return h2h;
};

const pct = (g, total) => `${Math.round((g / total) * 100)}%`;
const mayor = (lista, valor) => lista.reduce((m, r) => (valor(r) > valor(m) ? r : m));

export const resumenH2H = (rivales = []) => {
    if (!rivales.length) return { matches: {}, matchups: {} };
    const wins = rivales.reduce((s, r) => s + r.ganados, 0);
    const losses = rivales.reduce((s, r) => s + r.perdidos, 0);
    const tasa = (r) => r.ganados / (r.ganados + r.perdidos);
    const dato = (r, value) => ({ value, opponent: r.rival });
    const conGanados = rivales.filter((r) => r.ganados), conPerdidos = rivales.filter((r) => r.perdidos);
    const masGanado = conGanados.length ? mayor(conGanados, (r) => r.ganados) : null;
    const masPerdido = conPerdidos.length ? mayor(conPerdidos, (r) => r.perdidos) : null;
    const masJugado = mayor(rivales, (r) => r.ganados + r.perdidos);
    const mejor = mayor(rivales, (r) => tasa(r) + (r.ganados + r.perdidos) / 1e4);
    const peor = mayor(rivales, (r) => -tasa(r) + (r.ganados + r.perdidos) / 1e4);
    return {
        matches: { wins, losses, winRate: pct(wins, wins + losses) },
        matchups: {
            mostWon: masGanado && dato(masGanado, `${masGanado.ganados}x`),
            mostLost: masPerdido && dato(masPerdido, `${masPerdido.perdidos}x`),
            mostPlayed: dato(masJugado, `${masJugado.ganados + masJugado.perdidos}x`),
            bestWinRate: dato(mejor, pct(mejor.ganados, mejor.ganados + mejor.perdidos)),
            worstWinRate: dato(peor, pct(peor.ganados, peor.ganados + peor.perdidos)),
        },
    };
};

export const validarH2H = (ranking, h2h) => {
    const enRanking = new Set(ranking.map((j) => j.nombre));
    const faltan = ranking.filter((j) => !h2h.has(j.nombre)).map((j) => j.nombre);
    const sobran = [...h2h.keys()].filter((n) => !enRanking.has(n));
    if (h2h.size !== ranking.length) {
        throw new Error(`El head-to-head tiene ${h2h.size} jugadores y el ranking ${ranking.length}. Exporta el head-to-head con la misma cantidad de jugadores que el ranking.`);
    }
    if (faltan.length || sobran.length) {
        const lista = (nombres) => nombres.slice(0, 5).join(', ') + (nombres.length > 5 ? ` y ${nombres.length - 5} más` : '');
        throw new Error(`El head-to-head no coincide con el ranking.${faltan.length ? ` Faltan: ${lista(faltan)}.` : ''}${sobran.length ? ` No están en el ranking: ${lista(sobran)}.` : ''}`);
    }
};

export const armarJugadores = (ranking, h2h = new Map(), existentes = [], skinDe = () => '') => {
    if (h2h.size) validarH2H(ranking, h2h);
    const porNombre = new Map(existentes.map((j) => [j.nombre.trim().toLowerCase(), j]));
    return ranking.map((fila) => {
        const { nombre, team } = separarTeam(fila.nombre);
        const previo = porNombre.get(fila.nombre.toLowerCase()) || porNombre.get(nombre.toLowerCase()) || {};
        const main = fila.personajes.map((p) => skinDe(slugDePersonaje(p))).find(Boolean);
        const rivales = (h2h.get(fila.nombre) || []).map((r) => ({ ...r, rival: separarTeam(r.rival).nombre }));
        const { matches, matchups } = resumenH2H(rivales);
        return {
            puesto: fila.puesto,
            nombre,
            puntos: fila.puntos,
            personajes: fila.personajes,
            team: previo.team || team,
            skin: previo.skin || main || '',
            player_id: previo.player_id || '',
            h2h: rivales,
            matches,
            matchups,
        };
    });
};

// Tags actuales de start.gg, también en los rivales del h2h (se enlazan por nombre).
export const aplicarTagsStartgg = (jugadores, tags) => {
    const porId = new Map(tags.map((t) => [String(t.player_id), t]));
    const renombres = new Map();
    const conTags = jugadores.map((j) => {
        const t = porId.get(String(j.player_id || ''));
        if (!t) return j;
        if (t.gamerTag !== j.nombre) renombres.set(j.nombre, t.gamerTag);
        return { ...j, nombre: t.gamerTag, team: t.prefijo || null };
    });
    if (!renombres.size) return conTags;
    const nuevo = (n) => renombres.get(n) ?? n;
    return conTags.map((j) => ({
        ...j,
        h2h: j.h2h?.map((r) => ({ ...r, rival: nuevo(r.rival) })),
        matchups: j.matchups && Object.fromEntries(Object.entries(j.matchups).map(([k, v]) => [k, v && { ...v, opponent: nuevo(v.opponent) }])),
    }));
};
