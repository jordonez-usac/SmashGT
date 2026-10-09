import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import SitioPublico from './publico/SitioPublico';
import Inicio from './publico/Inicio';
import Noticias from './publico/Noticias';
import NoticiaDetalle from './publico/NoticiaDetalle';
import RankingPublico from './publico/RankingPublico';
import PerfilJugador from './publico/PerfilJugador';
import Jugadores from './publico/Jugadores';
import CaraACara from './publico/CaraACara';

const Resultados = lazy(() => import('./publico/Resultados'));
const Guia = lazy(() => import('./publico/Guia'));
const CargandoPagina = () => <p className="py-10 text-center text-sm text-slate-500">Cargando…</p>;

const AdminApp = lazy(() => import('./admin/AdminApp'));
const Torneos = lazy(() => import('./publico/Torneos'));

const CargandoPanel = () => (
    <p className="p-10 text-center text-sm text-slate-500">Cargando el panel…</p>
);

function GestionarSolicitud() {
    const { id } = useParams();
    return (
        <Suspense fallback={<CargandoPanel />}>
            <AdminApp pestanaInicial="solicitudes" solicitudResaltada={id} />
        </Suspense>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<SitioPublico />}>
                    <Route index element={<Inicio />} />
                    <Route path="noticias" element={<Noticias />} />
                    <Route path="noticias/:id" element={<NoticiaDetalle />} />
                    <Route path="ranking" element={<RankingPublico />} />
                    <Route path="jugador/:identificador" element={<PerfilJugador />} />
                    <Route path="jugadores" element={<Jugadores />} />
                    <Route path="h2h" element={<CaraACara />} />
                    <Route path="resultados" element={<Suspense fallback={<CargandoPagina />}><Resultados /></Suspense>} />
                    <Route path="guia" element={<Suspense fallback={<CargandoPagina />}><Guia /></Suspense>} />
                    <Route
                        path="torneos"
                        element={
                            <Suspense fallback={<p className="py-10 text-center text-sm text-slate-500">Cargando el mapa…</p>}>
                                <Torneos />
                            </Suspense>
                        }
                    />
                </Route>

                <Route
                    path="/admin"
                    element={
                        <Suspense fallback={<CargandoPanel />}>
                            <AdminApp />
                        </Suspense>
                    }
                />

                <Route path="/gestionar-solicitud/:id" element={<GestionarSolicitud />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
