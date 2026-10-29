import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Badge, Boton, Card } from '../components/ui';

const TONO = { pendiente: 'alerta', aceptada: 'ok', rechazada: 'error' };

const fecha = (valor) =>
    valor ? new Date(valor).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' }) : '';

export default function PanelSolicitudes({ ejecutar, ocupado, resaltada }) {
    const [solicitudes, setSolicitudes] = useState([]);

    const cargar = useCallback(async () => {
        setSolicitudes(await api.listarSolicitudes());
    }, []);

    useEffect(() => {
        cargar().catch(() => {});
    }, [cargar]);

    const responder = (solicitud, accion) => {
        const verbo = accion === 'aceptar' ? 'Aceptando' : 'Rechazando';
        const confirmacion =
            accion === 'aceptar'
                ? `¿Darle acceso al panel a ${solicitud.nombre} (${solicitud.email})?\n\nSe le va a enviar una contraseña temporal por correo.`
                : `¿Rechazar la solicitud de ${solicitud.nombre} (${solicitud.email})?`;
        if (!window.confirm(confirmacion)) return;

        ejecutar(`${verbo} la solicitud`, async () => {
            const data = await api.responderSolicitud(solicitud._id, accion);
            await cargar();
            return data.msg;
        });
    };

    const ordenadas = [...solicitudes].sort((a, b) => {
        if (a._id === resaltada) return -1;
        if (b._id === resaltada) return 1;
        if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const pendientes = solicitudes.filter((s) => s.estado === 'pendiente').length;

    return (
        <Card
            titulo="Solicitudes de acceso"
            acciones={
                <>
                    <Badge tono={pendientes ? 'alerta' : 'neutro'}>
                        {pendientes} pendiente{pendientes === 1 ? '' : 's'}
                    </Badge>
                    <Boton variante="fantasma" onClick={() => ejecutar('Actualizando', cargar)} disabled={Boolean(ocupado)}>
                        Actualizar
                    </Boton>
                </>
            }
        >
            {ordenadas.length === 0 ? (
                <p className="text-sm text-slate-500">Todavía no llegó ninguna solicitud.</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {ordenadas.map((s) => (
                        <li
                            key={s._id}
                            className={`rounded-md border p-3 ${
                                s._id === resaltada
                                    ? 'border-indigo-500 bg-indigo-500/5'
                                    : 'border-slate-800 bg-slate-900/40'
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-100">{s.nombre}</p>
                                    <p className="truncate text-sm text-slate-400">{s.email}</p>
                                    {s.motivo && (
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">{s.motivo}</p>
                                    )}
                                    <p className="mt-1 text-xs text-slate-600">
                                        Enviada el {fecha(s.createdAt)}
                                        {s.resueltaEn && ` · resuelta el ${fecha(s.resueltaEn)}`}
                                        {s.resueltaPor?.nombre && ` por ${s.resueltaPor.nombre}`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Badge tono={TONO[s.estado]}>{s.estado}</Badge>
                                    {s.estado === 'pendiente' && (
                                        <>
                                            <Boton onClick={() => responder(s, 'aceptar')} disabled={Boolean(ocupado)}>
                                                Aceptar
                                            </Boton>
                                            <Boton
                                                variante="peligro"
                                                onClick={() => responder(s, 'rechazar')}
                                                disabled={Boolean(ocupado)}
                                            >
                                                Rechazar
                                            </Boton>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
