import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { Estado, TarjetaNoticia, Titulo } from './piezas';
import BandaRanking from './BandaRanking';
import ExploradorTorneos from './ExploradorTorneos';
import { IconoFlecha, SmashBall } from './rotulacion';
import { arteDe, etiquetaDe } from '../lib/personajes';
import { interaccionPersonaje } from '../lib/interaccion';
import { cargarGeografia, departamentoDe } from '../lib/mapa';
import { EscenaDepartamentos, MainsEscena, PrimeraVez, ProximoTorneo } from './SeccionesEscena';

export default function Inicio() {
    const { datos: noticias, cargando: cargandoNoticias, error: errorNoticias } = useCargar(useCallback(() => api.listarNoticias(), []));
    const { datos: ranking, cargando: cargandoRanking, error: errorRanking } = useCargar(useCallback(() => api.rankingActual(), []));
    const { datos: datosTorneos } = useCargar(useCallback(() => api.listarTorneos(), []));
    const { datos: geojson } = useCargar(useCallback(() => cargarGeografia(), []));
    const torneos = useMemo(() => (datosTorneos?.torneos || []).map(t => ({ ...t, departamento: departamentoDe(t.lugar, geojson) })), [datosTorneos, geojson]);
    const jugadores = ranking ? [...ranking.jugadores].sort((a,b) => a.puesto-b.puesto) : [];
    const lider = jugadores[0];
    return (
        <div className="inicio space-y-16 sm:space-y-24">
            <section className="hero-inicio">
                <div className="hero-mensaje">
                    <h1 className="titulo-competitivo">Guatemala tiene nivel.<br /><span>Demuéstralo en el bracket.</span></h1>
                    <p className="mt-6 max-w-md text-base leading-7 text-tinta">Torneos, ranking y comunidad de Smash Bros. Ultimate en todo el país. Encuentra tu próximo torneo y conoce a quienes están poniendo el nivel.</p>
                    <div className="mt-7 flex flex-wrap items-center gap-4"><a href="#explorar" className="accion-principal">Encontrar un torneo <IconoFlecha tam={18} /></a><Link to="/ranking" className="accion-secundaria">Ver el ranking <IconoFlecha tam={16} /></Link></div>
                </div>
                {lider && <Link {...interaccionPersonaje} to={lider.player_id ? `/jugador/${encodeURIComponent(lider.player_id)}` : '/ranking'} className="hero-jugador" aria-label={`Conocer a ${lider.nombre}, puesto ${lider.puesto} del ranking`}>
                    <span className="hero-orbita" aria-hidden="true"><SmashBall className="hero-smash" /></span>
                    <span className="hero-numero cifra" aria-hidden="true">{String(lider.puesto).padStart(2,'0')}</span>
                    {arteDe(lider.skin) && <img className="hero-personaje arte-interactivo" src={arteDe(lider.skin)} alt={etiquetaDe(lider.skin)} fetchPriority="high" />}
                    <div className="hero-ficha"><h2>{lider.nombre}</h2><p>{lider.team ? `${lider.team} · ` : ''}#{lider.puesto} del ranking</p><span className="hero-ver"><IconoFlecha tam={22} /></span></div>
                </Link>}
            </section>
            <ProximoTorneo torneos={torneos} />
            <section id="explorar" className="scroll-mt-8">
                <div data-scroll="titulo" className="mb-5 flex flex-wrap items-end justify-between gap-3"><h2 className="titulo-competitivo text-3xl sm:text-4xl">Tu próxima partida<br /><span className="text-menta">empieza acá.</span></h2><p className="max-w-xs text-sm leading-6 text-tinta">Explora el mapa. Elige un torneo.<br />Nos vemos en el bracket.</p></div>
                <ExploradorTorneos portada />
            </section>
            <EscenaDepartamentos torneos={torneos} />
            <section>
                <Titulo extra={<Link to="/ranking" className="enlace-menta">Ranking completo <IconoFlecha /></Link>}>{ranking?.titulo || 'Ranking de la escena'}</Titulo>
                <Estado cargando={cargandoRanking} error={errorRanking} vacio={!ranking} textoVacio="El admin todavía no ha publicado un ranking." />
                {ranking && <BandaRanking jugadores={jugadores.slice(0,8)} />}
            </section>
            <MainsEscena jugadores={jugadores} />
            <PrimeraVez />
            <section>
                <Titulo extra={<Link to="/noticias" className="enlace-menta">Todas las noticias <IconoFlecha /></Link>}>En la comunidad</Titulo>
                <Estado cargando={cargandoNoticias} error={errorNoticias} vacio={!noticias?.length} textoVacio="El admin todavía no ha publicado noticias." />
                {noticias?.length > 0 && <div className="grid gap-5 md:grid-cols-3">{noticias.slice(0,3).map(n => <TarjetaNoticia key={n._id} noticia={n} />)}</div>}
            </section>
        </div>
    );
}
