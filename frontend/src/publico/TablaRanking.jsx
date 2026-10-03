import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ETIQUETAS_MATCHUP, tieneDatos, tieneH2H } from '../lib/h2h';
import { interaccionPersonaje } from '../lib/interaccion';
import { IconoFlecha } from './rotulacion';
import { ContenidoBanda } from './BandaRanking';


export const DetalleH2H = ({ jugador }) => (
    <div className="grid gap-6 border-t border-slate-800 bg-slate-950/60 px-4 py-4 text-sm sm:grid-cols-2">
        <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Récord</h4>
            <div className="flex gap-4">
                <span className="text-emerald-300">{jugador.matches?.wins ?? 0} V</span>
                <span className="text-red-300">{jugador.matches?.losses ?? 0} D</span>
                <span className="text-slate-400">{jugador.matches?.winRate ?? '0%'} de victorias</span>
            </div>
        </div>
        <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Matchups</h4>
            <dl className="space-y-1">
                {Object.entries(ETIQUETAS_MATCHUP).map(([clave, etiqueta]) => {
                    const stat = jugador.matchups?.[clave];
                    if (!tieneDatos(stat)) return null;
                    return (
                        <div key={clave} className="flex justify-between gap-4">
                            <dt className="text-slate-500">{etiqueta}</dt>
                            <dd className="text-right text-slate-300">
                                <span className="font-mono">{stat.value}</span> vs {stat.opponent}
                            </dd>
                        </div>
                    );
                })}
            </dl>
        </div>
    </div>
);

export default function TablaRanking({ jugadores }) {
    const [abierto, setAbierto] = useState(null);
    const navegar = useNavigate();

    if (!jugadores || jugadores.length === 0) {
        return <p className="text-sm text-slate-500">Este ranking no tiene jugadores todavía.</p>;
    }

    return (
        <div className="grid items-start gap-4 lg:grid-cols-2">
            {jugadores.map((j, i) => {
                const expandible = tieneH2H(j);
                const expandido = abierto === j.puesto;
                const perfil = j.player_id ? `/jugador/${encodeURIComponent(j.player_id)}` : null;
                const alternar = () => setAbierto(expandido ? null : j.puesto);
                const activar = perfil ? () => navegar(perfil) : (expandible ? alternar : null);

                return (
                    <div data-scroll="jugador" data-demora={i % 2 * .12} key={`${j.puesto}-${j.nombre}`}>
                        <div
                            role={activar ? 'button' : undefined}
                            tabIndex={activar ? 0 : undefined}
                            title={perfil ? `Ver el perfil de ${j.nombre}` : undefined}
                            onClick={() => activar?.()}
                            onKeyDown={(e) => {
                                if (!activar || e.target !== e.currentTarget) return;
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    activar();
                                }
                            }}
                            {...interaccionPersonaje}
                            data-podio={j.puesto <= 3 ? j.puesto : undefined}
                            style={{ '--i': i }}
                            className={`banda-jugador ${activar ? 'cursor-pointer' : ''}`}
                        >
                            <ContenidoBanda j={j} />

                            {expandible && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        alternar();
                                    }}
                                    aria-label={`Head-2-head de ${j.nombre}`}
                                    aria-expanded={expandido}
                                    className="banda-flecha min-h-11 w-11 text-center"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`mx-auto ${expandido ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                                </button>
                            )}

                            {perfil && !expandible && (
                                <span className="banda-flecha" aria-hidden>
                                    <IconoFlecha tam={15} />
                                </span>
                            )}
                        </div>

                        {expandido && <DetalleH2H jugador={j} />}
                    </div>
                );
            })}
        </div>
    );
}
