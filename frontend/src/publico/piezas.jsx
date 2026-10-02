import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { fmtFecha } from '../lib/formato';
import { IconoCorazon, IconoFlecha, Placa, Rotulo, SmashBall } from './rotulacion';

export const Estado = ({ cargando, error, vacio, textoVacio = 'Todavía no hay nada por acá.' }) => {
    if (cargando) {
        return (
            <p role="status" className="rotulo flex items-center justify-center gap-3 py-10 text-base text-tinta-baja [text-shadow:none]">
                <SmashBall tam={26} className="smash-carga text-menta" />
                Cargando…
            </p>
        );
    }
    if (error) {
        return (
            <Placa tono="bermellon" className="px-3 py-2 text-sm">
                {error}
            </Placa>
        );
    }
    if (vacio) {
        return (
            <p className="py-10 text-center text-sm text-tinta-baja">{textoVacio}</p>
        );
    }
    return null;
};

export const Titulo = ({ children, extra }) => (
    <div data-scroll="titulo" className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <Rotulo tam="seccion">{children}</Rotulo>
        {extra}
    </div>
);

const LIKES_KEY = 'smashgt_likes';
const leerLikes = () => {
    try {
        return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]'));
    } catch {
        return new Set();
    }
};

export function BotonLike({ noticiaId, likesIniciales = 0 }) {
    const [likes, setLikes] = useState(likesIniciales);
    const [yaDi, setYaDi] = useState(() => leerLikes().has(noticiaId));
    const [enviando, setEnviando] = useState(false);

    const dar = async () => {
        if (yaDi || enviando) return;
        setEnviando(true);
        try {
            const { likes: nuevos } = await api.darLike(noticiaId);
            setLikes(nuevos);
            setYaDi(true);
            const guardados = leerLikes();
            guardados.add(noticiaId);
            localStorage.setItem(LIKES_KEY, JSON.stringify([...guardados]));
        } catch {
        } finally {
            setEnviando(false);
        }
    };

    return (
        <button
            onClick={dar}
            disabled={yaDi || enviando}
            title={yaDi ? 'Ya le diste like desde este navegador' : 'Me gusta'}
            className={`cifra inline-flex min-h-10 items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-semibold transition-colors
                ${
                    yaDi
                        ? 'border-menta/40 bg-menta/10 text-menta'
                        : 'border-linea text-tinta hover:border-menta hover:text-menta'
                } disabled:cursor-default`}
        >
            <IconoCorazon lleno={yaDi} />
            {likes}
        </button>
    );
}

export function TarjetaNoticia({ noticia, destacada = false }) {
    return (
        <Placa
            data-scroll="tarjeta"
            tono="flanco"
            className={`tarjeta-noticia flex flex-col p-5 ${
                destacada ? 'sm:col-span-2' : ''
            }`}
        >
            <p className="cifra text-xs font-semibold text-tinta-baja">
                {fmtFecha(noticia.createdAt)}
                {noticia.autor?.nombre && ` · ${noticia.autor.nombre}`}
            </p>

            <Rotulo
                como="h3"
                tam={destacada ? 'seccion' : 'placa'}
                className="mt-4 text-white"
            >
                <Link to={`/noticias/${noticia._id}`} className="hover:text-cromo">
                    {noticia.titulo}
                </Link>
            </Rotulo>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-tinta">{noticia.descripcion}</p>

            <div className="mt-5 flex items-center justify-between gap-3">
                <Link
                    to={`/noticias/${noticia._id}`}
                    className="enlace-menta"
                >
                    Leer <IconoFlecha tam={14} />
                </Link>
                <BotonLike noticiaId={noticia._id} likesIniciales={noticia.likes} />
            </div>
        </Placa>
    );
}
