import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, borrarToken, leerToken } from '../lib/api';
import { Aviso, Badge, Boton } from '../components/ui';
import Login from '../components/Login';
import CambiarPassword from '../components/CambiarPassword';
import EditarPerfil from '../components/EditarPerfil';
import PanelRankings from './PanelRankings';
const PanelNoticias = lazy(() => import('./PanelNoticias'));
import PanelSolicitudes from './PanelSolicitudes';
import PanelTorneos from './PanelTorneos';

const PESTANAS = [
    { id: 'rankings', texto: 'Rankings' },
    { id: 'noticias', texto: 'Noticias' },
    { id: 'torneos', texto: 'Torneos' },
    { id: 'solicitudes', texto: 'Solicitudes', soloPrincipal: true },
];

export default function AdminApp({ pestanaInicial = 'rankings', solicitudResaltada }) {
    const [admin, setAdmin] = useState(null);
    const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(leerToken()));
    const [debeCambiarPassword, setDebeCambiarPassword] = useState(false);
    const [cambiandoPassword, setCambiandoPassword] = useState(false);
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [pestana, setPestana] = useState(pestanaInicial);
    const [aviso, setAviso] = useState(null);
    const [ocupado, setOcupado] = useState(null);

    const cerrarSesion = useCallback(() => {
        borrarToken();
        setAdmin(null);
        setDebeCambiarPassword(false);
        setCambiandoPassword(false);
        setEditandoPerfil(false);
    }, []);

    useEffect(() => {
        if (!leerToken()) return;
        let vigente = true;
        (async () => {
            try {
                const data = await api.yo();
                if (vigente) setAdmin(data.admin);
            } catch (err) {
                if (!vigente) return;
                if (err.status === 403 && err.datos?.requiereCambioPassword) {
                    setDebeCambiarPassword(true);
                } else {
                    borrarToken();
                }
            } finally {
                if (vigente) setCargandoSesion(false);
            }
        })();
        return () => {
            vigente = false;
        };
    }, []);

    const ejecutar = async (etiqueta, accion) => {
        setOcupado(etiqueta);
        setAviso(null);
        try {
            const mensaje = await accion();
            if (mensaje) setAviso({ tipo: 'exito', mensaje });
        } catch (err) {
            setAviso({ tipo: 'error', mensaje: err.message });
            if (err.status === 401) cerrarSesion();
            if (err.status === 403 && err.datos?.requiereCambioPassword) setDebeCambiarPassword(true);
        } finally {
            setOcupado(null);
        }
    };

    if (cargandoSesion) {
        return <p className="p-10 text-center text-sm text-slate-500">Verificando la sesión…</p>;
    }

    if (debeCambiarPassword) {
        return (
            <CambiarPassword
                obligatorio
                onListo={(datos) => {
                    setAdmin(datos);
                    setDebeCambiarPassword(false);
                    setAviso({ tipo: 'exito', mensaje: 'Listo, ya puedes usar el panel.' });
                }}
                onCancelar={cerrarSesion}
            />
        );
    }

    if (!admin) {
        return (
            <Login
                onLogin={(datos, requiereCambio) => {
                    if (requiereCambio) return setDebeCambiarPassword(true);
                    setAdmin(datos);
                }}
            />
        );
    }

    if (cambiandoPassword) {
        return (
            <CambiarPassword
                onListo={(datos) => {
                    setAdmin(datos);
                    setCambiandoPassword(false);
                    setAviso({ tipo: 'exito', mensaje: 'Contraseña actualizada.' });
                }}
                onCancelar={() => setCambiandoPassword(false)}
            />
        );
    }

    if (editandoPerfil) {
        return (
            <EditarPerfil
                admin={admin}
                onListo={(datos) => {
                    setAdmin(datos);
                    setEditandoPerfil(false);
                    setAviso({ tipo: 'exito', mensaje: 'Datos actualizados.' });
                }}
                onCancelar={() => setEditandoPerfil(false)}
            />
        );
    }

    const esPrincipal = admin.rol === 'principal';
    const pestanas = PESTANAS.filter((p) => !p.soloPrincipal || esPrincipal);
    const activa = pestanas.some((p) => p.id === pestana) ? pestana : pestanas[0].id;

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="titulo-competitivo text-2xl text-menta">SmashGT · panel de admin</h1>
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                        {admin.nombre}
                        {esPrincipal && <Badge tono="ok">principal</Badge>}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                        Ver el sitio
                    </Link>
                    <Boton variante="fantasma" onClick={() => setEditandoPerfil(true)}>
                        Mis datos
                    </Boton>
                    <Boton variante="fantasma" onClick={() => setCambiandoPassword(true)}>
                        Cambiar contraseña
                    </Boton>
                    <Boton variante="fantasma" onClick={cerrarSesion}>
                        Salir
                    </Boton>
                </div>
            </header>

            <div className="flex gap-1 overflow-x-auto border-b border-linea">
                {pestanas.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setPestana(p.id)}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activa === p.id
                                ? 'border-indigo-500 text-slate-100'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {p.texto}
                    </button>
                ))}
            </div>

            {ocupado && (
                <Aviso
                    tipo="info"
                    mensaje={`${ocupado}...`}
                />
            )}
            <Aviso tipo={aviso?.tipo} mensaje={aviso?.mensaje} onCerrar={() => setAviso(null)} />

            {activa === 'rankings' && <PanelRankings ejecutar={ejecutar} ocupado={ocupado} />}
            {activa === 'noticias' && <Suspense fallback={<p className="p-6 text-sm text-tinta">Cargando el editor…</p>}><PanelNoticias ejecutar={ejecutar} ocupado={ocupado} /></Suspense>}
            {activa === 'torneos' && <PanelTorneos ejecutar={ejecutar} ocupado={ocupado} />}
            {activa === 'solicitudes' && (
                <PanelSolicitudes ejecutar={ejecutar} ocupado={ocupado} resaltada={solicitudResaltada} />
            )}
        </div>
    );
}
