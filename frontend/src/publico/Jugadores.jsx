import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { etiquetaDe, nombreDe, partirSkin, retratoDe } from '../lib/personajes';
import { Estado, Titulo } from './piezas';
import { IconoFlecha } from './rotulacion';

const sinAcentos = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ABECEDARIO = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];
const letraDe = nombre => { const l = sinAcentos(nombre).trim().charAt(0).toUpperCase(); return /[A-Z]/.test(l) ? l : '#'; };

export default function Jugadores() {
    const { datos, cargando, error } = useCargar(useCallback(() => api.listarJugadores(), []));
    const [busqueda, setBusqueda] = useState('');
    const [main, setMain] = useState('');
    const [equipo, setEquipo] = useState('');
    const [rankingSel, setRankingSel] = useState('');
    const jugadores = datos || [];
    const mains = [...new Set(jugadores.map(j => partirSkin(j.skin).slug).filter(Boolean))].sort((a, b) => nombreDe(a).localeCompare(nombreDe(b), 'es'));
    const equipos = [...new Set(jugadores.map(j => j.team).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    const rankings = [...new Set(jugadores.flatMap(j => j.rankings))];
    const visibles = jugadores.filter(j =>
        sinAcentos(`${j.nombre} ${j.team || ''}`).includes(sinAcentos(busqueda.trim()))
        && (!main || partirSkin(j.skin).slug === main)
        && (!equipo || j.team === equipo)
        && (!rankingSel || j.rankings.includes(rankingSel)));
    const porLetra = Map.groupBy(visibles, j => letraDe(j.nombre));

    return (
        <div>
            <Titulo extra={<Link to="/h2h" className="enlace-menta">Comparar jugadores <IconoFlecha /></Link>}>Jugadores</Titulo>
            <Estado cargando={cargando} error={error} vacio={!cargando && !jugadores.length} textoVacio="Aún no hay jugadores." />
            {jugadores.length > 0 && <>
                <div className="filtros-jugadores superficie mb-6 grid gap-3 p-3 sm:grid-cols-[1fr_auto_auto_auto]">
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
                    {rankings.length > 1 && <select aria-label="Filtrar por ranking" value={rankingSel} onChange={e => setRankingSel(e.target.value)} className="campo-publico">
                        <option value="">Todos los rankings</option>
                        {rankings.map(r => <option key={r}>{r}</option>)}
                    </select>}
                </div>
                <p className="mb-4 text-xs font-semibold text-tinta-baja" aria-live="polite">{visibles.length} de {jugadores.length} jugadores</p>
                {visibles.length === 0
                    ? <p className="py-10 text-center text-sm text-tinta">Nadie coincide con esa búsqueda.</p>
                    : <>
                        <nav aria-label="Ir a la letra" className="mb-6 flex flex-wrap gap-1">
                            {ABECEDARIO.map(l => porLetra.has(l)
                                ? <a key={l} href={`#letra-${l}`} className="grid h-8 w-8 place-items-center rounded-md text-sm font-bold text-menta hover:bg-panel-alto">{l}</a>
                                : <span key={l} aria-hidden="true" className="grid h-8 w-8 place-items-center text-sm text-tinta-baja opacity-40">{l}</span>)}
                        </nav>
                        <div className="space-y-10">
                            {ABECEDARIO.filter(l => porLetra.has(l)).map(letra => <section key={letra} id={`letra-${letra}`} aria-label={`Letra ${letra}`} className="scroll-mt-24">
                                <h2 className="titulo-competitivo mb-4 flex items-center gap-4 text-3xl text-menta">{letra}<span className="h-px flex-1 bg-linea" /></h2>
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {porLetra.get(letra).map(j => {
                                        const Envoltura = j.player_id ? Link : 'div';
                                        return <li key={j.player_id || j.nombre}>
                                            <Envoltura {...(j.player_id ? { to: `/jugador/${encodeURIComponent(j.player_id)}` } : {})} className={`ficha-jugador superficie ${j.player_id ? 'ficha-enlace' : ''}`}>
                                                <img src={retratoDe(j.skin)} alt="" loading="lazy" className="ficha-retrato" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-bold text-white">{j.nombre}</p>
                                                    <p className="truncate text-xs text-tinta">{[j.team, etiquetaDe(j.skin)].filter(Boolean).join(' · ')}</p>
                                                    {rankings.length > 1 && <p className="mt-1 truncate text-xs text-tinta-baja" title={j.rankings.join(', ')}>{j.rankings.join(' · ')}</p>}
                                                </div>
                                            </Envoltura>
                                        </li>;
                                    })}
                                </ul>
                            </section>)}
                        </div>
                    </>}
            </>}
        </div>
    );
}
