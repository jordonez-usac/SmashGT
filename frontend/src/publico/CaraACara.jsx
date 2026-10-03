import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { arteDe, etiquetaDe, retratoDe } from '../lib/personajes';
import { Estado, Titulo } from './piezas';
import { SmashBall } from './rotulacion';

const mismo = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const numero = v => (v === undefined || v === null || v === '' ? null : Number(String(v).replace(/[^\d.]/g, '')) || 0);

function Lado({ jugador, jugadores, onCambiar, etiqueta, derecha }) {
    return (
        <div className={`cara-lado ${derecha ? 'cara-derecha' : ''}`}>
            <img src={arteDe(jugador.skin) || retratoDe(jugador.skin)} alt={etiquetaDe(jugador.skin)} className="cara-arte" />
            <div className="relative">
                <label className="text-[11px] font-bold uppercase tracking-widest text-menta" htmlFor={`cara-${etiqueta}`}>{etiqueta}</label>
                <select id={`cara-${etiqueta}`} value={jugador.puesto} onChange={e => onCambiar(e.target.value)} className="cara-selector">
                    {jugadores.map(j => <option key={j.puesto} value={j.puesto}>#{j.puesto} {j.nombre}</option>)}
                </select>
                <p className="titulo-competitivo cifra mt-3 text-5xl text-menta">{String(jugador.puesto).padStart(2, '0')}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-tinta">{[jugador.team, etiquetaDe(jugador.skin)].filter(Boolean).join(' · ')}</p>
                {jugador.player_id && <Link to={`/jugador/${encodeURIComponent(jugador.player_id)}`} className="enlace-menta mt-3 text-xs">Ver perfil</Link>}
            </div>
        </div>
    );
}

export default function CaraACara() {
    const { datos: ranking, cargando, error } = useCargar(useCallback(() => api.rankingActual(), []));
    const [params, setParams] = useSearchParams();
    const jugadores = useMemo(() => [...(ranking?.jugadores || [])].sort((a, b) => a.puesto - b.puesto), [ranking]);
    const buscar = (clave, defecto) => jugadores.find(j => String(j.puesto) === params.get(clave)) || jugadores[defecto];
    const a = buscar('a', 0);
    const b = jugadores.find(j => String(j.puesto) === params.get('b') && j !== a) || jugadores.find(j => j !== a);
    const cambiar = (clave, puesto) => setParams(p => { p.set(clave, puesto); return p; }, { replace: true });

    if (!a || !b) return <div><Titulo>Cara a cara</Titulo><Estado cargando={cargando} error={error} vacio textoVacio="Hacen falta al menos dos jugadores en el ranking." /></div>;

    const stats = [
        ['Puntos', numero(a.puntos), numero(b.puntos)],
        ['Victorias', numero(a.matches?.wins), numero(b.matches?.wins)],
        ['Derrotas', numero(a.matches?.losses), numero(b.matches?.losses), true],
        ['% de victorias', numero(a.matches?.winRate), numero(b.matches?.winRate)],
    ].filter(([, va, vb]) => va !== null || vb !== null);
    const directo = a.h2h?.find(r => mismo(r.rival, b.nombre));
    const sinMatriz = !a.h2h?.length || !b.h2h?.length;

    return (
        <div>
            <Titulo>Cara a cara</Titulo>
            <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-tinta">Elige dos jugadores del ranking y compara sus números.</p>
            <section className="cara-escenario">
                <Lado jugador={a} jugadores={jugadores} onCambiar={p => cambiar('a', p)} etiqueta="Jugador 1" />
                <div className="cara-vs" aria-hidden="true"><SmashBall tam={44} /><span>VS</span></div>
                <Lado jugador={b} jugadores={jugadores} onCambiar={p => cambiar('b', p)} etiqueta="Jugador 2" derecha />
            </section>

            <section className="superficie mt-6 p-5 sm:p-7" aria-label="Comparación">
                <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-bold text-white">
                    <span className="truncate">{a.nombre}</span><span className="text-xs text-tinta-baja">vs</span><span className="truncate text-right">{b.nombre}</span>
                </div>
                <dl className="grid gap-4">
                    {stats.map(([nombre, va, vb, menorEsMejor]) => {
                        const total = (va || 0) + (vb || 0) || 1;
                        const ambos = va !== null && vb !== null;
                        const ganaA = ambos && (menorEsMejor ? va < vb : va > vb), ganaB = ambos && (menorEsMejor ? vb < va : vb > va);
                        const ver = v => (v === null ? '—' : nombre === '% de victorias' ? `${v}%` : v);
                        return <div key={nombre}>
                            <dt className="mb-1.5 text-center text-xs font-semibold uppercase tracking-wider text-tinta">{nombre}</dt>
                            <dd className="grid grid-cols-[3rem_1fr_1fr_3rem] items-center gap-2">
                                <span className={`cifra text-right text-sm font-bold ${ganaA ? 'text-menta' : 'text-tinta'}`}>{ver(va)}</span>
                                <span className="cara-barra cara-barra-izq"><span style={{ width: `${(va || 0) / total * 100}%` }} className={ganaA ? 'gana' : ''} /></span>
                                <span className="cara-barra"><span style={{ width: `${(vb || 0) / total * 100}%` }} className={ganaB ? 'gana' : ''} /></span>
                                <span className={`cifra text-sm font-bold ${ganaB ? 'text-menta' : 'text-tinta'}`}>{ver(vb)}</span>
                            </dd>
                        </div>;
                    })}
                </dl>
            </section>

            <section className="superficie mt-6 p-5 sm:p-7">
                <h2 className="titulo-competitivo text-xl text-white">Entre ellos</h2>
                {directo ? <>
                    <div className="cara-directo cifra" aria-label={`${a.nombre} ${directo.ganados}, ${b.nombre} ${directo.perdidos}`}>
                        <span className={directo.ganados >= directo.perdidos ? 'gana' : ''}>{directo.ganados}</span><span className="text-tinta-baja">–</span><span className={directo.perdidos >= directo.ganados ? 'gana' : ''}>{directo.perdidos}</span>
                    </div>
                    <div className="cara-barra mt-3"><span className="gana" style={{ width: `${directo.ganados / (directo.ganados + directo.perdidos) * 100}%` }} /></div>
                    <p className="mt-3 text-sm text-tinta"><strong className="text-white">{a.nombre}</strong> {directo.ganados > directo.perdidos ? 'lleva la ventaja' : directo.ganados < directo.perdidos ? 'va abajo' : 'está empatado'} en {directo.ganados + directo.perdidos} {directo.ganados + directo.perdidos === 1 ? 'set' : 'sets'} contra <strong className="text-white">{b.nombre}</strong>, según Braacket.</p>
                </> : <p className="mt-3 text-sm leading-6 text-tinta">{sinMatriz ? 'Este ranking no tiene head-to-head cargado para estos jugadores.' : 'Estos dos todavía no se han enfrentado en los sets registrados.'}</p>}
            </section>
        </div>
    );
}
