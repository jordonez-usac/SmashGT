import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { fmtFechaCorta } from '../lib/formato';
import { ETIQUETAS_MATCHUP, tieneDatos } from '../lib/h2h';
import { arteDe, etiquetaDe, retratoDe } from '../lib/personajes';
import { interaccionPersonaje } from '../lib/interaccion';
import { Estado } from './piezas';
import { IconoCalendario, IconoExterno, IconoFlechaDir, IconoGente, IconoPin, SmashBall } from './rotulacion';

const mismo = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const ordinal = n => `${n}º`;

function FilaTorneo({ torneo }) {
    const podio = torneo.placement <= 3;
    return (
        <li>
            <a href={torneo.url} target="_blank" rel="noreferrer" className="perfil-torneo superficie">
                <span className={`perfil-lugar cifra ${podio ? 'podio' : ''}`}>{torneo.placement === 1 ? <SmashBall tam={20} /> : ordinal(torneo.placement)}</span>
                {torneo.imagen ? <img src={torneo.imagen} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-lg object-cover" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-panel-alto text-menta"><IconoCalendario tam={18} /></span>}
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-white">{torneo.nombre}</span>
                    <span className="block truncate text-xs text-tinta">{[torneo.evento, torneo.ciudad || (torneo.en_guatemala ? '' : 'En línea / otro país'), fmtFechaCorta(torneo.fecha)].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="hidden text-right text-xs text-tinta sm:block">{torneo.placement === 1 ? 'Campeón' : `${ordinal(torneo.placement)} lugar`}{torneo.entrantes ? <><br />de {torneo.entrantes}</> : null}</span>
                <IconoExterno tam={15} />
            </a>
        </li>
    );
}

export default function PerfilJugador() {
    const { identificador } = useParams();
    const { datos, cargando, error } = useCargar(useCallback(() => api.obtenerJugador(identificador), [identificador]));
    const { datos: ranking } = useCargar(useCallback(() => api.rankingActual(), []));
    const [soloGuatemala, setSoloGuatemala] = useState(true);

    const sg = datos?.startgg;
    const jugador = datos?.local?.jugador;
    const nombre = jugador?.nombre || [sg?.prefijo, sg?.gamerTag].filter(Boolean).join(' | ') || 'Jugador';
    const todos = sg?.torneos || [];
    const deGuatemala = todos.filter(t => t.en_guatemala);
    const visibles = soloGuatemala ? deGuatemala : todos;
    const mejor = deGuatemala.reduce((m, t) => (!m || t.placement < m.placement ? t : m), null);
    const arte = arteDe(jugador?.skin);

    const rivales = Object.entries(ETIQUETAS_MATCHUP)
        .filter(([clave]) => tieneDatos(jugador?.matchups?.[clave]))
        .map(([clave, etiqueta]) => {
            const { value, opponent } = jugador.matchups[clave];
            const rival = ranking?.jugadores.find(j => mismo(j.nombre, opponent));
            return { clave, etiqueta, value, opponent, rival };
        });

    const stats = [
        jugador && ['Ranking', `#${jugador.puesto}`, jugador.puntos ? `${jugador.puntos} puntos` : datos.local.ranking?.titulo],
        tieneDatos(jugador?.matches) && ['Récord', `${jugador.matches.wins}–${jugador.matches.losses}`, jugador.h2h?.length ? 'Contra el ranking' : 'Victorias y derrotas'],
        jugador?.matches?.winRate && ['% de victorias', jugador.matches.winRate, 'En sets del ranking'],
        sg && ['Torneos', deGuatemala.length, 'Recientes en Guatemala'],
        mejor && ['Mejor resultado', ordinal(mejor.placement), mejor.nombre],
        sg && ['Top 8', deGuatemala.filter(t => t.placement <= 8).length, `${deGuatemala.filter(t => t.placement <= 3).length} podios`],
    ].filter(Boolean);

    return (
        <div className="space-y-8">
            <Link to="/jugadores" className="volver inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                <IconoFlechaDir dir={180} /> Volver a jugadores
            </Link>

            <Estado cargando={cargando} error={error} vacio={false} />

            {datos && <>
                <section className="perfil-cabecera">
                    <div {...interaccionPersonaje} className={`perfil-banner ${sg?.banner ? 'con-banner' : 'bloque-acento'}`}>
                        {sg?.banner && <img src={sg.banner} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                        {!sg?.banner && <SmashBall className="perfil-banner-smash" />}
                        {arte && <img src={arte} alt={etiquetaDe(jugador.skin)} className="perfil-arte arte-interactivo" />}
                        {jugador && <span className="perfil-puesto cifra" aria-hidden="true">{String(jugador.puesto).padStart(2, '0')}</span>}
                    </div>
                    <div className="perfil-identidad">
                        {sg?.avatar || jugador?.skin
                            ? <img src={sg?.avatar || retratoDe(jugador.skin)} alt="" className="perfil-avatar" />
                            : <span className="perfil-avatar perfil-inicial" aria-hidden="true">{(sg?.gamerTag || nombre).trim().charAt(0)}</span>}
                        <div className="min-w-0 flex-1">
                            <h1 className="titulo-competitivo break-words text-[clamp(1.9rem,4.5vw,3.4rem)] text-white">{nombre}</h1>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {jugador && <span className="perfil-chip">#{jugador.puesto} del ranking</span>}
                                {jugador?.skin && <span className="perfil-chip"><img src={retratoDe(jugador.skin)} alt="" className="h-5 w-5 rounded-full" />{etiquetaDe(jugador.skin)}</span>}
                                {jugador?.personajes?.filter(p => !mismo(p, etiquetaDe(jugador.skin))).map(p => <span key={p} className="perfil-chip">{p}</span>)}
                                {jugador?.team && <span className="perfil-chip"><IconoGente tam={14} />{jugador.team}</span>}
                                {sg?.ubicacion && <span className="perfil-chip"><IconoPin tam={14} />{sg.ubicacion}</span>}
                                {sg?.pronombre && <span className="perfil-chip">{sg.pronombre}</span>}
                            </div>
                            {sg?.bio && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-6 text-tinta">{sg.bio}</p>}
                        </div>
                        <div className="flex flex-wrap gap-3 sm:flex-col sm:items-end">
                            {jugador && <Link to={`/h2h?a=${jugador.puesto}`} className="boton-menta">Comparar</Link>}
                            {sg?.url_perfil && <a href={sg.url_perfil} target="_blank" rel="noreferrer" className="enlace-menta">Ver en start.gg <IconoExterno tam={15} /></a>}
                        </div>
                    </div>
                </section>

                {stats.length > 0 && <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {stats.map(([titulo, valor, detalle], i) => (
                        <div key={titulo} data-scroll="tarjeta" data-demora={i * .05} className="perfil-stat superficie">
                            <dt className="text-[11px] font-bold uppercase tracking-widest text-tinta">{titulo}</dt>
                            <dd className="titulo-competitivo cifra mt-2 text-3xl text-white">{valor}</dd>
                            {detalle && <dd className="mt-1 truncate text-xs text-tinta-baja" title={detalle}>{detalle}</dd>}
                        </div>
                    ))}
                </dl>}

                {rivales.length > 0 && <section>
                    <h2 className="titulo-competitivo mb-4 text-2xl text-white">Rivales</h2>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {rivales.map(r => (
                            <li key={r.clave} className="perfil-rival superficie">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-tinta">{r.etiqueta}</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <img src={retratoDe(r.rival?.skin)} alt="" className="h-10 w-10 shrink-0 rounded-full bg-panel-alto object-cover" />
                                    <div className="min-w-0"><p className="truncate font-bold text-white">{r.opponent}</p><p className="cifra text-sm font-semibold text-menta">{r.value}</p></div>
                                </div>
                                {r.rival && jugador && <Link to={`/h2h?a=${jugador.puesto}&b=${r.rival.puesto}`} className="enlace-menta mt-3 text-xs">Cara a cara</Link>}
                            </li>
                        ))}
                    </ul>
                </section>}

                {jugador?.h2h?.length > 0 && <section>
                    <h2 className="titulo-competitivo mb-1 text-2xl text-white">Head-to-head</h2>
                    <p className="mb-4 text-sm text-tinta">Sets ganados y perdidos contra cada jugador del ranking, según Braacket.</p>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {[...jugador.h2h].sort((x, y) => (y.ganados + y.perdidos) - (x.ganados + x.perdidos)).map(r => {
                            const rival = ranking?.jugadores.find(j => mismo(j.nombre, r.rival));
                            const contenido = <>
                                <img src={retratoDe(rival?.skin)} alt="" className="h-9 w-9 shrink-0 rounded-full bg-panel-alto object-cover" />
                                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-white">{r.rival}</span><span className="cara-barra mt-1.5 block h-1.5"><span className="gana" style={{ width: `${r.ganados / (r.ganados + r.perdidos) * 100}%` }} /></span></span>
                                <span className="cifra text-sm font-bold"><span className="text-gana">{r.ganados}</span><span className="text-tinta-baja"> – </span><span className="text-pierde">{r.perdidos}</span></span>
                            </>;
                            return <li key={r.rival}>{rival ? <Link to={`/h2h?a=${jugador.puesto}&b=${rival.puesto}`} className="perfil-h2h superficie">{contenido}</Link> : <div className="perfil-h2h superficie">{contenido}</div>}</li>;
                        })}
                    </ul>
                </section>}

                <section>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <h2 className="titulo-competitivo text-2xl text-white">Resultados recientes</h2>
                        {todos.length > deGuatemala.length && <div className="flex gap-1 rounded-lg bg-panel-alto p-1" role="group" aria-label="Filtrar resultados">
                            {[[true, `Guatemala (${deGuatemala.length})`], [false, `Todos (${todos.length})`]].map(([valor, texto]) => <button key={texto} type="button" aria-pressed={soloGuatemala === valor} onClick={() => setSoloGuatemala(valor)} className={`min-h-10 rounded-md px-3 text-xs font-semibold ${soloGuatemala === valor ? 'bg-menta text-noche' : 'text-tinta'}`}>{texto}</button>)}
                        </div>}
                    </div>
                    {datos.error_startgg && <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">No se pudo consultar start.gg en este momento. Vuelve a intentar en un rato.</p>}
                    {!datos.error_startgg && visibles.length === 0 && <p className="text-sm text-tinta">{sg ? 'start.gg no tiene torneos recientes de este jugador en Guatemala.' : 'Este jugador todavía no tiene su perfil de start.gg enlazado.'}</p>}
                    {visibles.length > 0 && <ol className="grid grid-cols-1 gap-2 lg:grid-cols-2">{visibles.map(t => <FilaTorneo key={`${t.id}-${t.evento}`} torneo={t} />)}</ol>}
                </section>
            </>}
        </div>
    );
}
