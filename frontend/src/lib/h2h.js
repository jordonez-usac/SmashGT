export const tieneDatos = (valor) => {
    if (!valor || typeof valor !== 'object') return false;
    return Object.values(valor).some((v) => {
        if (v === null || v === undefined || v === '') return false;
        if (typeof v === 'object') return tieneDatos(v);
        return true;
    });
};

export const tieneH2H = (jugador) =>
    tieneDatos(jugador?.matchups) || tieneDatos(jugador?.matches);

export const ETIQUETAS_MATCHUP = {
    mostWon: 'Más ganados',
    mostLost: 'Más perdidos',
    mostPlayed: 'Más jugados',
    bestWinRate: 'Mejor win rate',
    worstWinRate: 'Peor win rate',
};

export const contarMatchups = (matchups) =>
    Object.keys(ETIQUETAS_MATCHUP).filter((k) => tieneDatos(matchups?.[k])).length;
