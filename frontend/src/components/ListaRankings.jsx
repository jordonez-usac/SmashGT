import { Badge, Boton } from './ui';

export default function ListaRankings({ rankings, rankingActivoId, ocupado, onAbrir, onEliminar }) {
    if (rankings.length === 0) {
        return <p className="text-sm text-slate-500">Todavía no hay rankings guardados.</p>;
    }

    return (
        <ul className="divide-y divide-slate-800">
            {rankings.map((r) => (
                <li key={r._id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-slate-100">{r.titulo}</span>
                            {r._id === rankingActivoId && <Badge tono="ok">abierto</Badge>}
                        </div>
                        <p className="font-mono text-xs text-slate-500">
                            {r._id} · actualizado {new Date(r.updatedAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Boton variante="secundario" onClick={() => onAbrir(r._id)} disabled={ocupado}>
                            Abrir
                        </Boton>
                        <Boton variante="peligro" onClick={() => onEliminar(r)} disabled={ocupado}>
                            Borrar
                        </Boton>
                    </div>
                </li>
            ))}
        </ul>
    );
}
