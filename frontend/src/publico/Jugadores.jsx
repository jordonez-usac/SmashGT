import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { tieneDatos } from '../lib/h2h';
import { etiquetaDe, nombreDe, partirSkin, retratoDe } from '../lib/personajes';
import { Estado, Titulo } from './piezas';
import { IconoFlecha } from './rotulacion';

const sinAcentos = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Jugadores() {
    const { datos: ranking, cargando, error } = useCargar(useCallback(() => api.rankingActual(), []));
    const [busqueda, setBusqueda] = useState('');
    const [main, setMain] = useState('');
    const [equipo, setEquipo] = useState('');
    const jugadores = useMemo(() => [...(ranking?.jugadores || [])].sort((a, b) => a.puesto - b.puesto), [ranking]);
    const mains = [...new Set(jugadores.map(j => partirSkin(j.skin).slug).filter(Boolean))].sort((a, b) => nombreDe(a).localeCompare(nombreDe(b), 'es'));
    const equipos = [...new Set(jugadores.map(j => j.team).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    const visibles = jugadores.filter(j =>
        sinAcentos(`${j.nombre} ${j.team || ''}`).includes(sinAcentos(busqueda.trim()))
        && (!main || partirSkin(j.skin).slug === main)
        && (!equipo || j.team === equipo));

    return (
        <div>
            <Titulo extra={<Link to="/h2h" className="enlace-menta">Comparar jugadores <IconoFlecha /></Link>}>Jugadores</Titulo>
            <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-tinta">Todos los jugadores del ranking actual. Busca por nombre o filtra por personaje y equipo.</p>
            <Estado cargando={cargando} error={error} vacio={!cargando && !jugadores.length} textoVacio="Todavía no hay un ranking publicado." />
            {jugadores.length > 0 && <>
                <div className="filtros-jugadores superficie mb-6 grid gap-3 p-3 sm:grid-cols-[1fr_auto_auto]">
                    <label className="sr-only" htmlFor="buscar-jugador">Buscar jugador</label>
                    <input id="buscar-jugador" type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar jugador o equipo…" className="campo-publico" />
                    <select aria-label="Filtrar por personaje" value={main} onChange={e => setMain(e.target.value)} className="campo-publico">
                        <option value="">Todos los personajes</option>
                        {mains.map(m => <option key={m} value={m}>{nombreDe(m)}</option>)}
                    </select>
                    {equipos.length > 0 && <select aria-label="Filtrar por equipo" value={equipo} onChange={e => setEquipo(e.target.value)} className="campo-publico">
                        <option value="">Todos los equipos</option>
                        {equipos.map(e => <option key={e}>{e}</option>)}
                    </select>}
                </div>
                <p className="mb-4 text-xs font-semibold text-tinta-baja" aria-live="polite">{visibles.length} de {jugadores.length} jugadores</p>
                {visibles.length === 0
                    ? <p className="py-10 text-center text-sm text-tinta">Nadie coincide con esa búsqueda.</p>
                    : <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visibles.map(j => {
                            const Envoltura = j.player_id ? Link : 'div';
                            return <li key={`${j.puesto}-${j.nombre}`}>
                                <Envoltura {...(j.player_id ? { to: `/jugador/${encodeURIComponent(j.player_id)}` } : {})} className={`ficha-jugador superficie ${j.player_id ? 'ficha-enlace' : ''}`}>
                                    <img src={retratoDe(j.skin)} alt="" loading="lazy" className="ficha-retrato" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold text-white">{j.nombre}</p>
                                        <p className="truncate text-xs text-tinta">{[j.team, etiquetaDe(j.skin)].filter(Boolean).join(' · ')}</p>
                                        <p className="cifra mt-1 text-xs">{j.puntos ? <span className="font-semibold text-tinta">{j.puntos} pts</span> : null}{j.puntos && tieneDatos(j.matches) ? <span className="text-tinta-baja"> · </span> : null}{tieneDatos(j.matches) && <><span className="text-gana">{j.matches.wins} V</span> <span className="text-tinta-baja">/</span> <span className="text-pierde">{j.matches.losses} D</span></>}</p>
                                    </div>
                                    <span className="titulo-competitivo cifra text-2xl text-menta">{String(j.puesto).padStart(2, '0')}</span>
                                </Envoltura>
                            </li>;
                        })}
                    </ul>}
            </>}
        </div>
    );
}
