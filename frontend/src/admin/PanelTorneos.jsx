import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { Area, Aviso, Badge, Boton, Campo, Card } from '../components/ui';
import MapaGuatemala from '../components/MapaGuatemala';
import { fmtFechaCorta } from '../lib/formato';
import { IconoFlecha } from '../publico/rotulacion';

const VACIO = {
    id: null,
    nombre: '',
    descripcion: '',
    fecha: '',
    fecha_fin: '',
    lugar: { nombre: '', direccion: '', ciudad: '', lat: null, lng: null },
    imagen: '',
    url: '',
    publicado: true
};

const aInput = (valor) => {
    if (!valor) return '';
    const d = new Date(valor);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const deTorneo = (t) => ({
    id: t._id,
    nombre: t.nombre,
    descripcion: t.descripcion || '',
    fecha: aInput(t.fecha),
    fecha_fin: aInput(t.fecha_fin),
    lugar: { nombre: '', direccion: '', ciudad: '', ...t.lugar },
    imagen: t.imagen || '',
    url: t.url || '',
    publicado: t.publicado
});

export default function PanelTorneos({ ejecutar, ocupado }) {
    const [torneos, setTorneos] = useState([]);
    const [torneo, setTorneo] = useState(VACIO);
    const [errorCarga, setErrorCarga] = useState(null);
    const [cargando, setCargando] = useState(true);

    const cargar = useCallback(async () => {
        setCargando(true);
        setErrorCarga(null);
        try { setTorneos(await api.listarTorneosManuales()); }
        catch (error) { setErrorCarga(error.message); throw error; }
        finally { setCargando(false); }
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

    const editarLugar = (campo, valor) =>
        setTorneo((t) => ({ ...t, lugar: { ...t.lugar, [campo]: valor } }));

    const guardar = () =>
        correr('Guardando torneo', async () => {
            const payload = {
                nombre: torneo.nombre,
                descripcion: torneo.descripcion,
                fecha: new Date(torneo.fecha).toISOString(),
                fecha_fin: torneo.fecha_fin ? new Date(torneo.fecha_fin).toISOString() : null,
                lugar: torneo.lugar,
                imagen: torneo.imagen,
                url: torneo.url,
                publicado: torneo.publicado
            };

            const guardado = torneo.id
                ? await api.actualizarTorneo(torneo.id, payload)
                : await api.crearTorneo(payload);

            setTorneo(deTorneo(guardado));
            return `Torneo "${guardado.nombre}" guardado.`;
        });

    const eliminar = (t) => {
        if (!window.confirm(`¿Borrar el torneo "${t.nombre}"?`)) return;
        return correr('Borrando torneo', async () => {
            await api.eliminarTorneo(t._id);
            if (torneo.id === t._id) setTorneo(VACIO);
            return `Torneo "${t.nombre}" eliminado.`;
        });
    };

    const ubicado = torneo.lugar.lat != null && torneo.lugar.lng != null;
    const puedeGuardar = torneo.nombre && torneo.fecha && ubicado && !ocupado;

    const pinEnEdicion = useMemo(
        () => (ubicado
            ? [{ id: 'edicion', fuente: 'manual', nombre: torneo.nombre || 'Torneo nuevo', lugar: torneo.lugar }]
            : []),
        [ubicado, torneo.nombre, torneo.lugar]
    );

    return (
        <div className="space-y-4">
            <Card titulo={torneo.id ? '1 · Editando un torneo' : '1 · Torneo nuevo'}>
                <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-3">
                            <Campo
                                label="Nombre"
                                value={torneo.nombre}
                                onChange={(e) => setTorneo({ ...torneo, nombre: e.target.value })}
                                className="w-72"
                            />
                            <Campo
                                label="Inicia"
                                type="datetime-local"
                                value={torneo.fecha}
                                onChange={(e) => setTorneo({ ...torneo, fecha: e.target.value })}
                            />
                            <Campo
                                label="Termina (opcional)"
                                type="datetime-local"
                                value={torneo.fecha_fin}
                                onChange={(e) => setTorneo({ ...torneo, fecha_fin: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Campo
                                label="Lugar"
                                placeholder="Otaku Store zona 1"
                                value={torneo.lugar.nombre}
                                onChange={(e) => editarLugar('nombre', e.target.value)}
                                className="w-56"
                            />
                            <Campo
                                label="Ciudad"
                                placeholder="Ciudad de Guatemala"
                                value={torneo.lugar.ciudad}
                                onChange={(e) => editarLugar('ciudad', e.target.value)}
                                className="w-56"
                            />
                            <Campo
                                label="Dirección"
                                value={torneo.lugar.direccion}
                                onChange={(e) => editarLugar('direccion', e.target.value)}
                                className="w-72"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Campo
                                label="Imagen (URL del flyer)"
                                value={torneo.imagen}
                                onChange={(e) => setTorneo({ ...torneo, imagen: e.target.value })}
                                className="w-80"
                            />
                            <Campo
                                label="Link (start.gg u otro)"
                                value={torneo.url}
                                onChange={(e) => setTorneo({ ...torneo, url: e.target.value })}
                                className="w-80"
                            />
                        </div>

                        <Area
                            label="Descripción"
                            rows={3}
                            value={torneo.descripcion}
                            onChange={(e) => setTorneo({ ...torneo, descripcion: e.target.value })}
                        />

                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={torneo.publicado}
                                    onChange={(e) => setTorneo({ ...torneo, publicado: e.target.checked })}
                                />
                                Publicado en el mapa
                            </label>
                            <Boton onClick={guardar} disabled={!puedeGuardar}>
                                {torneo.id ? 'Actualizar' : 'Crear torneo'}
                            </Boton>
                            {torneo.id && (
                                <Boton variante="fantasma" onClick={() => setTorneo(VACIO)}>
                                    Nuevo
                                </Boton>
                            )}
                            {!ubicado && (
                                <span className="inline-flex items-center gap-1.5 text-sm text-amber-300">
                                    Falta marcar el lugar en el mapa <IconoFlecha tam={14} />
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <MapaGuatemala
                            torneos={pinEnEdicion}
                            seleccionado="edicion"
                            onElegirPunto={({ lat, lng, departamento }) =>
                                setTorneo((t) => ({
                                    ...t,
                                    lugar: {
                                        ...t.lugar,
                                        lat: Number(lat.toFixed(6)),
                                        lng: Number(lng.toFixed(6)),
                                        ciudad: t.lugar.ciudad || departamento
                                    }
                                }))
                            }
                            className="h-72"
                        />
                        <p className="text-xs text-slate-500">
                            Haz click en el mapa para poner el pin.{' '}
                            {ubicado ? (
                                <span className="font-mono text-slate-400">
                                    {torneo.lugar.lat}, {torneo.lugar.lng}
                                </span>
                            ) : (
                                'Sin ubicación todavía.'
                            )}
                        </p>
                    </div>
                </div>
            </Card>

            <Card titulo={`2 · Torneos cargados (${torneos.length})`}>
                {cargando ? <p role="status" className="text-sm text-tinta">Cargando torneos…</p> : errorCarga ? <div role="alert" className="space-y-3"><Aviso tipo="error" mensaje={errorCarga} /><Boton onClick={() => cargar().catch(() => {})}>Volver a intentar</Boton></div> : torneos.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        Todavía no cargaste torneos. Los de start.gg salen solos en el mapa.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {torneos.map((t) => (
                            <div
                                key={t._id}
                                className="flex flex-wrap items-center gap-3 rounded-md border border-slate-800 px-3 py-2"
                            >
                                <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
                                    <p className="break-words font-semibold leading-6 text-white">{t.nombre}</p>
                                    <p className="text-xs text-slate-500">
                                        {[fmtFechaCorta(new Date(t.fecha).getTime()), t.lugar?.ciudad]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                </div>
                                <Badge tono={t.publicado ? 'ok' : 'alerta'}>
                                    {t.publicado ? 'publicado' : 'oculto'}
                                </Badge>
                                <Boton variante="fantasma" onClick={() => setTorneo(deTorneo(t))} disabled={Boolean(ocupado)}>
                                    Editar
                                </Boton>
                                <Boton variante="peligro" onClick={() => eliminar(t)} disabled={Boolean(ocupado)}>
                                    Borrar
                                </Boton>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
