import { useCallback } from 'react';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { Estado, TarjetaNoticia, Titulo } from './piezas';

export default function Noticias() {
    const { datos: noticias, cargando, error } = useCargar(
        useCallback(() => api.listarNoticias(), [])
    );

    const lista = noticias || [];

    return (
        <div>
            <Titulo
                extra={
                    lista.length > 0 && (
                        <span className="text-sm text-slate-500">{lista.length} publicadas</span>
                    )
                }
            >
                Noticias
            </Titulo>

            <Estado
                cargando={cargando}
                error={error}
                vacio={lista.length === 0}
                textoVacio="Aún no hay noticias."
            />

            <div className="grid gap-4 sm:grid-cols-2">
                {lista.map((n) => (
                    <TarjetaNoticia key={n._id} noticia={n} />
                ))}
            </div>
        </div>
    );
}
