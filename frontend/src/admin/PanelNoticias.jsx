import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Area, Badge, Boton, Campo, Card } from '../components/ui';
import EditorHtml from './EditorHtml';

const NOTICIA_VACIA = { id: null, titulo: '', descripcion: '', contenido: '' };

export default function PanelNoticias({ ejecutar, ocupado }) {
    const [noticias, setNoticias] = useState([]);
    const [noticia, setNoticia] = useState(NOTICIA_VACIA);

    const cargar = useCallback(async () => {
        setNoticias(await api.listarNoticias());
    }, []);

    useEffect(() => {
        cargar().catch(() => {});
    }, [cargar]);

    const correr = (etiqueta, accion) =>
        ejecutar(etiqueta, async () => {
            const mensaje = await accion();
            await cargar();
            return mensaje;
        });

    const editar = (n) =>
        setNoticia({
            id: n._id,
            titulo: n.titulo,
            descripcion: n.descripcion,
            contenido: n.contenido,
        });

    const guardar = () =>
        correr(noticia.id ? 'Actualizando noticia' : 'Publicando noticia', async () => {
            const payload = {
                titulo: noticia.titulo,
                descripcion: noticia.descripcion,
                contenido: noticia.contenido,
            };
            const guardada = noticia.id
                ? await api.actualizarNoticia(noticia.id, payload)
                : await api.crearNoticia(payload);

            setNoticia({
                id: guardada._id,
                titulo: guardada.titulo,
                descripcion: guardada.descripcion,
                contenido: guardada.contenido,
            });

            const recortado = guardada.contenido.length !== payload.contenido.length;
            return (
                `Noticia "${guardada.titulo}" ${noticia.id ? 'actualizada' : 'publicada'}.` +
                (recortado ? ' El backend limpió etiquetas no permitidas del HTML.' : '')
            );
        });

    const eliminar = (n) => {
        if (!window.confirm(`¿Borrar la noticia "${n.titulo}"?`)) return;
        return correr('Borrando noticia', async () => {
            await api.eliminarNoticia(n._id);
            if (noticia.id === n._id) setNoticia(NOTICIA_VACIA);
            return `Noticia "${n.titulo}" eliminada.`;
        });
    };

    const listo = noticia.titulo && noticia.descripcion && noticia.contenido;

    return (
        <div className="space-y-4">
            <Card
                titulo={noticia.id ? 'Editar noticia' : 'Nueva noticia'}
                acciones={
                    <>
                        {noticia.id && <Badge tono="ok">editando · {noticia.id}</Badge>}
                        <Boton onClick={guardar} disabled={!listo || Boolean(ocupado)}>
                            {noticia.id ? 'Actualizar' : 'Publicar'}
                        </Boton>
                        {(noticia.id || noticia.titulo) && (
                            <Boton
                                variante="fantasma"
                                onClick={() => setNoticia(NOTICIA_VACIA)}
                                disabled={Boolean(ocupado)}
                            >
                                Nueva
                            </Boton>
                        )}
                    </>
                }
            >
                <div className="space-y-4">
                    <Campo
                        label="Título"
                        value={noticia.titulo}
                        onChange={(e) => setNoticia({ ...noticia, titulo: e.target.value })}
                        placeholder="Resultados del torneo mensual de agosto"
                    />

                    <Area
                        label="Descripción (el resumen que se ve en las tarjetas del sitio)"
                        rows={2}
                        value={noticia.descripcion}
                        onChange={(e) => setNoticia({ ...noticia, descripcion: e.target.value })}
                        placeholder="Dos o tres líneas contando de qué va la nota."
                    />

                    <div className="flex flex-col gap-1 text-sm">
                        <span className="font-medium text-slate-400">Contenido</span>
                        <EditorHtml
                            value={noticia.contenido}
                            onChange={(contenido) => setNoticia({ ...noticia, contenido })}
                        />
                        <p className="text-xs text-slate-500">
                            TinyMCE self-hosted (licencia GPL): no sale a internet ni pide API key.
                            Las imágenes que pegues quedan embebidas en el HTML como data URI —
                            mientras no exista un endpoint de subida, conviene no pasarse de peso.
                        </p>
                    </div>
                </div>
            </Card>

            <Card titulo="Noticias publicadas">
                {noticias.length === 0 ? (
                    <p className="text-sm text-slate-500">Todavía no hay noticias publicadas.</p>
                ) : (
                    <ul className="divide-y divide-slate-800">
                        {noticias.map((n) => (
                            <li key={n._id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate font-medium text-slate-100">{n.titulo}</span>
                                        {n._id === noticia.id && <Badge tono="ok">abierta</Badge>}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {new Date(n.createdAt).toLocaleString()} ·{' '}
                                        {n.autor?.nombre || 'autor desconocido'} · {n.likes} likes
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Boton variante="secundario" onClick={() => editar(n)} disabled={Boolean(ocupado)}>
                                        Editar
                                    </Boton>
                                    <Boton variante="peligro" onClick={() => eliminar(n)} disabled={Boolean(ocupado)}>
                                        Borrar
                                    </Boton>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
