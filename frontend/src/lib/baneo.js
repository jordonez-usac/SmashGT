export const ESCENARIOS = [
    { slug: 'battlefield', nombre: 'Battlefield' },
    { slug: 'small-battlefield', nombre: 'Small Battlefield' },
    { slug: 'final-destination', nombre: 'Final Destination' },
    { slug: 'pokemon-stadium-2', nombre: 'Pokémon Stadium 2' },
    { slug: 'town-and-city', nombre: 'Town and City' },
    { slug: 'smashville', nombre: 'Smashville' },
    { slug: 'hollow-bastion', nombre: 'Hollow Bastion' },
    { slug: 'kalos-pokemon-league', nombre: 'Kalos Pokémon League' },
].map(e => ({ ...e, imagen: `/stages/${e.slug}.webp` }));

export const nombreEscenario = slug => ESCENARIOS.find(e => e.slug === slug)?.nombre || slug;

export const CONFIG_INICIAL = {
    nombres: ['Jugador 1', 'Jugador 2'],
    mejorDe: 3,
    baneos: 3,
    dsr: true,
    iniciales: ['battlefield', 'small-battlefield', 'final-destination', 'pokemon-stadium-2', 'town-and-city'],
    counterpicks: ['smashville', 'hollow-bastion', 'kalos-pokemon-league'],
};

// Striking del game 1: 1-2-2-1-1-2…
export const ordenStrikes = (total, primero) =>
    Array.from({ length: Math.max(total - 1, 0) }, (_, i) => (Math.floor((i + 1) / 2) % 2 === 0 ? primero : 1 - primero));

// El estado se arma desde las acciones; deshacer = quitar la última.
export function estadoSet(config, acciones) {
    const necesarias = Math.ceil(config.mejorDe / 2);
    const juegos = [];
    const marcador = [0, 0];
    let primero = null;
    let quitados = [];
    let quitadosPor = {};
    let escenario = null;

    for (const a of acciones) {
        if (a.tipo === 'primero') primero = a.jugador;
        else if (a.tipo === 'quitar') { quitados = [...quitados, a.escenario]; quitadosPor = { ...quitadosPor, [a.escenario]: a.jugador }; }
        else if (a.tipo === 'elegir') escenario = a.escenario;
        else if (a.tipo === 'ganador') {
            juegos.push({ escenario: escenario ?? config.iniciales.find(e => !quitados.includes(e)), ganador: a.jugador });
            marcador[a.jugador]++;
            quitados = [];
            quitadosPor = {};
            escenario = null;
        }
    }

    const base = { juego: juegos.length + 1, juegos, marcador, quitados, quitadosPor, bloqueados: [], escenario, turno: null, pendientes: 0 };
    if (marcador.some(m => m >= necesarias)) return { ...base, juego: juegos.length, fase: 'fin', campeon: marcador[0] >= necesarias ? 0 : 1 };
    if (escenario) return { ...base, fase: 'jugando' };

    if (!juegos.length) {
        if (primero === null) return { ...base, fase: 'primero' };
        const orden = ordenStrikes(config.iniciales.length, primero);
        const disponibles = config.iniciales.filter(e => !quitados.includes(e));
        if (disponibles.length === 1) return { ...base, fase: 'jugando', escenario: disponibles[0] };
        const turno = orden[quitados.length];
        let pendientes = 0;
        for (let i = quitados.length; orden[i] === turno; i++) pendientes++;
        return { ...base, fase: 'strike', turno, pendientes, disponibles };
    }

    const ganador = juegos.at(-1).ganador;
    const perdedor = 1 - ganador;
    const lista = [...config.iniciales, ...config.counterpicks];
    const disponibles = lista.filter(e => !quitados.includes(e));
    const baneos = Math.min(config.baneos, lista.length - 1);
    if (quitados.length < baneos) return { ...base, fase: 'ban', turno: ganador, pendientes: baneos - quitados.length, disponibles };

    // DSR: no puede elegir donde ya ganó, salvo que no quede otro.
    const ganadosPorPerdedor = config.dsr ? juegos.filter(j => j.ganador === perdedor).map(j => j.escenario) : [];
    const bloqueados = disponibles.every(e => ganadosPorPerdedor.includes(e)) ? [] : ganadosPorPerdedor.filter(e => disponibles.includes(e));
    return { ...base, fase: 'pick', turno: perdedor, pendientes: 1, disponibles, bloqueados };
}
