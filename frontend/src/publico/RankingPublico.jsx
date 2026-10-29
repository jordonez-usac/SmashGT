import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { Estado, Titulo } from './piezas';
import { fmtFecha } from '../lib/formato';
import TablaRanking from './TablaRanking';

export default function RankingPublico() {
    const [seleccionado, setSeleccionado] = useState(null);

    const { datos: lista, cargando: cargandoLista, error: errorLista } = useCargar(
        useCallback(() => api.listarRankings(), [])
    );

    useEffect(() => {
        if (lista?.length && !seleccionado) setSeleccionado(lista[0]._id);
    }, [lista, seleccionado]);

    const { datos: ranking, cargando: cargandoRanking, error: errorRanking } = useCargar(
        useCallback(() => (seleccionado ? api.obtenerRanking(seleccionado) : Promise.resolve(null)), [seleccionado])
    );

    const rankings = lista || [];

    return (
        <div>
            <Titulo
                extra={
                    ranking && (
                        <span className="text-sm text-slate-500">
                            {ranking.jugadores.length} jugadores · actualizado {fmtFecha(ranking.updatedAt)}
                        </span>
                    )
                }
            >
                Ranking
            </Titulo>

            <Estado
                cargando={cargandoLista}
                error={errorLista}
                vacio={rankings.length === 0}
                textoVacio="Aún no hay ranking."
            />

            {rankings.length > 1 && (
                <div className="mb-5 flex flex-wrap gap-2">
                    {rankings.map((r) => (
                        <button
                            key={r._id}
                            onClick={() => setSeleccionado(r._id)}
                            aria-pressed={r._id === seleccionado}
                            className={`min-h-10 rounded-md border px-3 py-1 text-sm transition-colors ${
                                r._id === seleccionado
                                    ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-200'
                                    : 'border-slate-700 text-slate-400 hover:text-slate-100'
                            }`}
                        >
                            {r.titulo}
                        </button>
                    ))}
                </div>
            )}

            {seleccionado && <Estado cargando={cargandoRanking} error={errorRanking} vacio={false} />}

            {ranking && (
                <>
                    <TablaRanking jugadores={[...ranking.jugadores].sort((a,b) => a.puesto-b.puesto)} />
                    <p className="mt-3 text-xs text-slate-600">
                        Toca a un jugador para ver su perfil con sus torneos de start.gg, o usa la flecha desplegable para su head-2-head.
                    </p>
                </>
            )}
        </div>
    );
}
