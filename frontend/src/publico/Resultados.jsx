import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { fmtFecha } from '../lib/formato';
import { retratoDe } from '../lib/personajes';
import { Estado, Titulo } from './piezas';
import { IconoCalendario, IconoExterno, IconoGente, IconoPin, SmashBall } from './rotulacion';

const sinPrefijo = n => String(n || '').split('|').pop().trim().toLowerCase();

const buscarSkin = (fila, jugadores) => jugadores.find(j =>
    (fila.player_id && j.player_id === fila.player_id) || sinPrefijo(j.nombre) === sinPrefijo(fila.nombre))?.skin;

function Torneo({ torneo, jugadores }) {
    const [indice, setIndice] = useState(0);
    const evento = torneo.eventos[indice];
    return (
        <article data-scroll="tarjeta" className="resultado superficie">
            <header className="flex gap-4">
                {torneo.imagen ? <img src={torneo.imagen} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-noche text-menta"><SmashBall tam={30} /></span>}
                <div className="min-w-0 flex-1">
                    <h2 className="titulo-competitivo text-xl leading-tight text-white">{torneo.nombre}</h2>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-tinta">
                        <span className="flex items-center gap-1.5"><IconoCalendario tam={14} />{fmtFecha(torneo.fecha)}</span>
                        {torneo.ciudad && <span className="flex items-center gap-1.5"><IconoPin tam={14} />{torneo.ciudad}</span>}
                        {torneo.asistentes > 0 && <span className="flex items-center gap-1.5"><IconoGente tam={14} />{torneo.asistentes} asistentes</span>}
                    </p>
                </div>
            </header>
            {torneo.eventos.length > 1 && <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="Evento">
                {torneo.eventos.map((e, i) => <button type="button" key={e.id} onClick={() => setIndice(i)} aria-pressed={i === indice} className={`min-h-9 rounded-md px-3 text-xs font-semibold ${i === indice ? 'bg-menta text-noche' : 'text-tinta hover:bg-panel-alto'}`}>{e.nombre}</button>)}
            </div>}
            <ol className="mt-4 grid gap-1.5">
                {evento.top.map(fila => {
                    const skin = buscarSkin(fila, jugadores);
                    const contenido = <>
                        <span className="resultado-puesto cifra">{fila.puesto}</span>
                        <img src={retratoDe(skin)} alt="" loading="lazy" className="h-8 w-8 shrink-0 rounded-full bg-panel-alto object-cover" />
                        <span className="min-w-0 flex-1 truncate font-semibold text-white">{fila.nombre}</span>
                        {fila.puesto === 1 && <SmashBall tam={16} className="text-menta" />}
                    </>;
                    return <li key={`${fila.puesto}-${fila.nombre}`}>
                        {fila.player_id
                            ? <Link to={`/jugador/${fila.player_id}`} className="resultado-fila" data-puesto={fila.puesto}>{contenido}</Link>
                            : <div className="resultado-fila" data-puesto={fila.puesto}>{contenido}</div>}
                    </li>;
                })}
            </ol>
            <a href={evento.url} target="_blank" rel="noreferrer" className="enlace-menta mt-4 text-xs">Bracket completo · {evento.entrantes} jugadores <IconoExterno tam={14} /></a>
        </article>
    );
}

export default function Resultados() {
    const { datos, cargando, error, recargar } = useCargar(useCallback(() => api.listarResultados(), []));
    const { datos: ranking } = useCargar(useCallback(() => api.rankingActual(), []));
    return (
        <div>
            <Titulo>Resultados</Titulo>
            <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-tinta">El top 8 de los torneos jugados en Guatemala durante el último año, directo de start.gg.</p>
            <Estado cargando={cargando} error={null} vacio={!cargando && !error && !datos?.length} textoVacio="Todavía no hay resultados publicados en start.gg." />
            {error && <div role="alert" className="superficie space-y-3 p-5 text-sm text-tinta"><p>{error}</p><button onClick={recargar} className="boton-menta">Volver a intentar</button></div>}
            {datos?.length > 0 && <div className="grid items-start gap-5 lg:grid-cols-2">
                {datos.map(t => <Torneo key={t.id} torneo={t} jugadores={ranking?.jugadores || []} />)}
            </div>}
        </div>
    );
}
