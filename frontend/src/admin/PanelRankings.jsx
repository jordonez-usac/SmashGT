import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { tieneH2H } from '../lib/h2h';
import { Badge, Boton, Campo, Card } from '../components/ui';
import EditorJugadores from '../components/EditorJugadores';
import ListaRankings from '../components/ListaRankings';
import VisorJson from '../components/VisorJson';
import GuiaBraacket from '../components/GuiaBraacket';
import { armarJugadores, leerH2H, leerRanking } from '../lib/braacketCsv';
import { PERSONAJES, armarSkin } from '../lib/personajes';

const skinDe = (slug) => (PERSONAJES.includes(slug) ? armarSkin(slug) : '');

const RANKING_VACIO = { id: null, titulo: '', jugadores: [] };

export default function PanelRankings({ ejecutar, ocupado }) {
    const [rankings, setRankings] = useState([]);
    const [ranking, setRanking] = useState(RANKING_VACIO);
    const [csvRanking, setCsvRanking] = useState(null);
    const [csvH2H, setCsvH2H] = useState(null);
    const [desdeCsv, setDesdeCsv] = useState(false);
    const [omitirH2H, setOmitirH2H] = useState(false);

    const cargarRankings = useCallback(async () => {
        setRankings(await api.listarRankings());
    }, []);

    useEffect(() => {
        cargarRankings().catch(() => {});
    }, [cargarRankings]);

    const correr = (etiqueta, accion) =>
        ejecutar(etiqueta, async () => {
            const mensaje = await accion();
            await cargarRankings();
            return mensaje;
        });

    const importar = () =>
        correr('Leyendo los CSV', async () => {
            const filas = leerRanking(await csvRanking.text());
            const h2h = csvH2H ? leerH2H(await csvH2H.text()) : new Map();
            const jugadores = armarJugadores(filas, h2h, ranking.jugadores, skinDe);
            setRanking({ ...ranking, titulo: ranking.titulo || 'Ranking de Braacket', jugadores });
            setDesdeCsv(true);
            const conH2H = jugadores.filter((j) => j.h2h.length).length;
            return `Leídos ${jugadores.length} jugadores, ${conH2H} con head-to-head. Todavía no se guardó nada: revisa y dale "${ranking.id ? 'Actualizar' : 'Guardar como nuevo'}".`;
        });

    const abrir = (id) =>
        correr('Abriendo ranking', async () => {
            const data = await api.obtenerRanking(id);
            setDesdeCsv(false);
            setRanking({
                id: data._id,
                titulo: data.titulo,
                jugadores: data.jugadores,
            });
            const conH2H = data.jugadores.filter(tieneH2H).length;
            return `Abierto "${data.titulo}": ${data.jugadores.length} jugadores, ${conH2H} con head-2-head guardado.`;
        });

    const construirPayload = () => ({
        titulo: ranking.titulo,
        ...(desdeCsv && !omitirH2H ? { reemplazar_h2h: true } : {}),
        jugadores: ranking.jugadores.map((j) => {
            const base = {
                puesto: j.puesto,
                nombre: j.nombre,
                team: j.team ?? null,
                skin: j.skin ?? '',
                player_id: j.player_id ?? '',
                braacket_id: j.braacket_id ?? '',
                url_perfil: j.url_perfil ?? '',
                puntos: j.puntos ?? null,
                personajes: j.personajes ?? [],
            };
            if (!omitirH2H) {
                base.matchups = j.matchups;
                base.matches = j.matches;
                base.h2h = j.h2h ?? [];
            }
            return base;
        }),
    });

    const guardar = () =>
        correr('Guardando', async () => {
            const payload = construirPayload();
            const guardado = ranking.id
                ? await api.actualizarRanking(ranking.id, payload)
                : await api.crearRanking(payload);

            setDesdeCsv(false);
            setRanking({
                id: guardado._id,
                titulo: guardado.titulo,
                jugadores: guardado.jugadores,
            });

            const conH2H = guardado.jugadores.filter(tieneH2H).length;
            const enviados = payload.jugadores.filter(tieneH2H).length;
            return `Guardado. Mandaste ${enviados} jugadores con h2h y volvieron ${conH2H} con h2h` +
                (omitirH2H ? ' — o sea, el backend heredó el guardado.' : '.');
        });


    const eliminar = (r) => {
        if (!window.confirm(`¿Borrar el ranking "${r.titulo}"? Esto no se puede deshacer.`)) return;
        return correr('Borrando', async () => {
            await api.eliminarRanking(r._id);
            if (ranking.id === r._id) setRanking(RANKING_VACIO);
            return `Ranking "${r.titulo}" eliminado.`;
        });
    };

    return (
        <div className="space-y-4">
            <Card titulo="1 · Importar desde Braacket (CSV)">
                <div className="mb-4"><GuiaBraacket abierta={ranking.jugadores.length === 0} /></div>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    {[['CSV del ranking', csvRanking, setCsvRanking], ['CSV del head-to-head', csvH2H, setCsvH2H]].map(([texto, archivo, elegir]) => (
                        <label key={texto} className={`selector-csv ${archivo ? 'listo' : ''}`}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Zm0 0v5h5M9 13h6M9 17h6" /></svg>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-slate-100">{texto}</span>
                                <span className="block truncate text-xs text-slate-400">{archivo ? archivo.name : 'Toca para elegir el archivo .csv'}</span>
                            </span>
                            <input type="file" accept=".csv,text/csv" onChange={(e) => elegir(e.target.files[0] || null)} className="sr-only" />
                        </label>
                    ))}
                    <Boton onClick={importar} disabled={!csvRanking || Boolean(ocupado)} className="min-h-14">
                        {ranking.id ? 'Actualizar con los CSV' : 'Importar'}
                    </Boton>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    Si abres un ranking guardado antes de importar, se conservan sus mains, player_id y equipos.
                    El head-to-head debe tener los mismos jugadores que el ranking (si no, se rechaza). El récord y los rivales se calculan con esos sets.
                </p>
            </Card>

            <Card
                titulo="2 · Editar el ranking"
                acciones={
                    <>
                        {ranking.id ? (
                            <Badge tono="ok">guardado · {ranking.id}</Badge>
                        ) : (
                            ranking.jugadores.length > 0 && <Badge tono="alerta">sin guardar</Badge>
                        )}
                        <Boton
                            onClick={guardar}
                            disabled={ranking.jugadores.length === 0 || !ranking.titulo || Boolean(ocupado)}
                        >
                            {ranking.id ? 'Actualizar' : 'Guardar como nuevo'}
                        </Boton>
                        {ranking.jugadores.length > 0 && (
                            <Boton variante="fantasma" onClick={() => setRanking(RANKING_VACIO)} disabled={Boolean(ocupado)}>
                                Limpiar
                            </Boton>
                        )}
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <Campo
                            label="Título"
                            value={ranking.titulo}
                            onChange={(e) => setRanking({ ...ranking, titulo: e.target.value })}
                            className="w-80"
                        />
                    </div>

                    <label className="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm">
                        <input
                            type="checkbox"
                            checked={omitirH2H}
                            onChange={(e) => setOmitirH2H(e.target.checked)}
                            className="mt-0.5"
                        />
                        <span>
                            <span className="font-medium text-slate-200">
                                Mandar el payload sin head-2-head
                            </span>
                            <span className="block text-xs text-slate-500">
                                Recorta matchups y matches del JSON que se envía, como haría un
                                frontend que solo edita puestos y skins. Al guardar, el backend
                                debe devolverte el h2h que ya tenía. Es la prueba de la herencia.
                            </span>
                        </span>
                    </label>

                    <EditorJugadores
                        jugadores={ranking.jugadores}
                        onChange={(cambio) => setRanking((r) => ({ ...r, jugadores: typeof cambio === 'function' ? cambio(r.jugadores) : cambio }))}
                    />
                </div>
            </Card>

            <Card titulo="3 · Rankings guardados">
                <ListaRankings
                    rankings={rankings}
                    rankingActivoId={ranking.id}
                    ocupado={Boolean(ocupado)}
                    onAbrir={abrir}
                    onEliminar={eliminar}
                />
            </Card>

            <VisorJson titulo="Payload que se va a enviar" data={construirPayload()} />
        </div>
    );
}
