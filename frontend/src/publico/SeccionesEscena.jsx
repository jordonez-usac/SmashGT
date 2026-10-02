import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtFecha } from '../lib/formato';
import { nombreDe, partirSkin, retratoDe } from '../lib/personajes';
import { IconoCalendario, IconoControl, IconoFlecha, IconoGente, IconoInscripcion, IconoPin, SmashBall } from './rotulacion';

const dos = n => String(n).padStart(2, '0');

function useAhora() {
    const [ahora, setAhora] = useState(Date.now);
    useEffect(() => {
        const reloj = setInterval(() => setAhora(Date.now()), 1000);
        return () => clearInterval(reloj);
    }, []);
    return ahora;
}

export function ProximoTorneo({ torneos }) {
    const ahora = useAhora();
    const ordenados = [...torneos].sort((a, b) => a.fecha - b.fecha);
    const torneo = ordenados.find(t => t.fecha <= ahora && ahora - t.fecha < 3 * 864e5 && (t.fecha_fin || t.fecha + 864e5) >= ahora)
        || ordenados.find(t => t.fecha > ahora);
    if (!torneo) return null;
    const falta = Math.max(0, torneo.fecha - ahora);
    const enCurso = falta === 0;
    const partes = [['días', Math.floor(falta / 864e5)], ['horas', Math.floor(falta / 36e5) % 24], ['min', Math.floor(falta / 6e4) % 60], ['seg', Math.floor(falta / 1e3) % 60]];
    return (
        <section data-scroll="panel" className="proximo-torneo zona-oscura" aria-label="Próximo torneo">
            <div className="min-w-0">
                <p className="proximo-etiqueta"><SmashBall tam={16} className="proximo-smash" />{enCurso ? 'Se está jugando ahora' : 'Próximo torneo'}</p>
                <h2 className="titulo-competitivo mt-3 text-2xl sm:text-3xl">{torneo.nombre}</h2>
                <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta">
                    <span className="flex items-center gap-1.5"><IconoCalendario tam={15} />{fmtFecha(torneo.fecha)}</span>
                    <span className="flex items-center gap-1.5"><IconoPin tam={15} />{torneo.lugar?.ciudad || torneo.departamento || torneo.lugar?.nombre || 'Guatemala'}</span>
                </p>
            </div>
            {!enCurso && <div className="proximo-reloj cifra" role="timer" aria-label={`Faltan ${partes[0][1]} días y ${partes[1][1]} horas`}>
                {partes.map(([nombre, valor]) => <div key={nombre}><span>{dos(valor)}</span><small>{nombre}</small></div>)}
            </div>}
            {torneo.url
                ? <a href={torneo.url} target="_blank" rel="noreferrer" className="boton-menta shrink-0">Inscribirme <IconoFlecha tam={16} /></a>
                : <a href="#explorar" className="boton-menta shrink-0">Ver en el mapa <IconoFlecha tam={16} /></a>}
        </section>
    );
}

export function EscenaDepartamentos({ torneos }) {
    const conteo = Object.entries(torneos.reduce((acc, t) => {
        if (t.departamento) acc[t.departamento] = (acc[t.departamento] || 0) + 1;
        return acc;
    }, {})).sort((a, b) => b[1] - a[1]);
    if (!conteo.length) return null;
    const maximo = conteo[0][1];
    return (
        <section>
            <div data-scroll="titulo" className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <h2 className="titulo-competitivo text-3xl sm:text-4xl">Guatemala juega<br /><span className="text-menta">de punta a punta.</span></h2>
                <p className="max-w-xs text-sm leading-6 text-tinta">Torneos recientes y próximos por departamento. ¿No ves el tuyo? Organiza uno y ponlo en el mapa.</p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {conteo.slice(0, 6).map(([nombre, total], i) => (
                    <li key={nombre} data-scroll="tarjeta" data-demora={i % 3 * .08} className="departamento-fila superficie">
                        <span className="titulo-competitivo cifra text-2xl text-menta">{dos(i + 1)}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-white">{nombre}</p>
                            <span className="departamento-medida" style={{ '--medida': `${total / maximo * 100}%` }} aria-hidden="true" />
                        </div>
                        <span className="cifra text-sm font-semibold text-tinta">{total} {total === 1 ? 'torneo' : 'torneos'}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

export function MainsEscena({ jugadores }) {
    const grupos = Object.values(jugadores.reduce((acc, j) => {
        const { slug } = partirSkin(j.skin);
        if (slug) (acc[slug] ||= { slug, skin: j.skin, jugadores: [] }).jugadores.push(j.nombre);
        return acc;
    }, {})).sort((a, b) => b.jugadores.length - a.jugadores.length).slice(0, 6);
    if (!grupos.length) return null;
    return (
        <section>
            <div data-scroll="titulo" className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <h2 className="titulo-competitivo text-3xl sm:text-4xl">Los mains<br /><span className="text-menta">de la escena.</span></h2>
                <p className="max-w-xs text-sm leading-6 text-tinta">Los personajes que más se ven en el ranking. ¿El tuyo está aquí?</p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {grupos.map((g, i) => (
                    <li key={g.slug} data-scroll="tarjeta" data-demora={i % 6 * .06} className="main-tarjeta">
                        <img src={retratoDe(g.skin)} alt="" loading="lazy" className="main-retrato" />
                        <p className="titulo-competitivo relative text-base text-white">{nombreDe(g.slug)}</p>
                        <p className="cifra relative mt-1 text-xs font-semibold text-menta">{g.jugadores.length} {g.jugadores.length === 1 ? 'jugador' : 'jugadores'}</p>
                        <p className="relative mt-2 line-clamp-2 text-[11px] leading-4 text-tinta">{g.jugadores.slice(0, 3).join(' · ')}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}

const PASOS = [
    [IconoPin, 'Busca un torneo', 'Usa el mapa para encontrar el más cercano a ti y revisa la fecha y la dirección.'],
    [IconoInscripcion, 'Inscríbete', 'La inscripción, el costo y las reglas están en la página de cada torneo en start.gg.'],
    [IconoControl, 'Lleva tu control', 'GameCube, Pro Controller o el que uses. Así juegas cómodo desde la primera partida.'],
    [IconoGente, 'Juega y conoce gente', 'La mayoría de torneos son de doble eliminación: perder una vez no te saca.'],
];

export function PrimeraVez() {
    return (
        <section data-scroll="panel" className="primera-vez bloque-acento">
            <SmashBall className="smash-marca" />
            <div className="max-w-sm">
                <h2 className="titulo-competitivo text-3xl sm:text-4xl">¿Primera vez<br />en un torneo?</h2>
                <p className="mt-4 text-sm leading-6">No necesitas ser pro. Los torneos locales están llenos de gente que empezó igual que tú.</p>
                <Link to="/torneos" className="accion-principal mt-6">Buscar mi primer torneo <IconoFlecha tam={18} /></Link>
            </div>
            <ol className="grid flex-1 gap-3 sm:grid-cols-2">
                {PASOS.map(([Icono, titulo, texto], i) => (
                    <li key={titulo} className="primera-paso">
                        <div className="flex items-center justify-between"><span className="titulo-competitivo cifra text-3xl">{dos(i + 1)}</span><span className="primera-icono"><Icono tam={22} /></span></div>
                        <p className="mt-2 font-bold">{titulo}</p>
                        <p className="mt-1 text-sm leading-6">{texto}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}
