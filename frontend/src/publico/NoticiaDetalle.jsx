import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { BotonLike, Estado } from './piezas';
import { fmtFecha } from '../lib/formato';
import { IconoFlechaDir } from './rotulacion';

export default function NoticiaDetalle() {
    const { id } = useParams();
    const { datos: noticia, cargando, error } = useCargar(
        useCallback(() => api.obtenerNoticia(id), [id])
    );

    return (
        <article className="mx-auto max-w-3xl">
            <Link to="/noticias" className="volver inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                <IconoFlechaDir dir={180} /> Volver a noticias
            </Link>

            <Estado cargando={cargando} error={error} vacio={false} />

            {noticia && (
                <div className="superficie mt-4 p-5 shadow-lg sm:p-10">
                    <header className="border-b border-slate-800 pb-5">
                        <h1 className="text-3xl font-black tracking-tight text-slate-50">{noticia.titulo}</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {fmtFecha(noticia.createdAt)}
                            {noticia.autor?.nombre && ` · por ${noticia.autor.nombre}`}
                        </p>
                        <p className="mt-3 text-lg leading-relaxed text-slate-400">{noticia.descripcion}</p>
                    </header>

                    <div
                        className="contenido-noticia mt-6"
                        dangerouslySetInnerHTML={{ __html: noticia.contenido }}
                    />

                    <footer className="mt-10 flex items-center justify-between border-t border-slate-800 pt-5">
                        <span className="text-sm text-slate-500">¿Te sirvió esta nota?</span>
                        <BotonLike noticiaId={noticia._id} likesIniciales={noticia.likes} />
                    </footer>
                </div>
            )}
        </article>
    );
}
