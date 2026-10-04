import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useCargar } from '../lib/useCargar';
import { cargarGeografia, departamentoDe } from '../lib/mapa';
import { fmtFechaCorta } from '../lib/formato';
import MapaGuatemala from '../components/MapaGuatemala';
import DetalleAnimado from './DetalleAnimado';
import { IconoCalendario, IconoFlecha, IconoPin } from './rotulacion';

export default function ExploradorTorneos({ portada = false }) {
    const [periodo, setPeriodo] = useState('proximos');
    const [departamento, setDepartamento] = useState('');
    const [seleccionado, setSeleccionado] = useState(null);
    const tarjetas = useRef({});
    const { datos, cargando, error, recargar } = useCargar(useCallback(() => api.listarTorneos(), []));
    const { datos: geojson, error: errorGeo, recargar: recargarGeo } = useCargar(useCallback(() => cargarGeografia(), []));
    const torneos = useMemo(() => (datos?.torneos || []).map(t => ({ ...t, departamento: departamentoDe(t.lugar, geojson) })), [datos, geojson]);
    const porPeriodo = useMemo(() => {
        const ahora = Date.now();
        return torneos.filter(t => {
            const final = t.fecha_fin || t.fecha;
            return periodo === 'todos' || (periodo === 'proximos' ? final >= ahora : final < ahora);
        }).sort((a,b) => periodo === 'pasados' ? b.fecha-a.fecha : a.fecha-b.fecha);
    }, [torneos, periodo]);
    const visibles = porPeriodo.filter(t => !departamento || t.departamento === departamento);
    const activo = visibles.find(t => t.id === seleccionado);
    const cambiarDepartamento = d => { setDepartamento(d); setSeleccionado(null); };
    const seleccionar = t => {
        if (departamento && t.departamento !== departamento) setDepartamento(t.departamento || '');
        setSeleccionado(t.id);
    };
    useEffect(() => {
        if (seleccionado) tarjetas.current[seleccionado]?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }, [seleccionado]);

    return (
        <div className="overflow-hidden rounded-2xl border border-linea">
            <div className="bloque-acento flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-7">
                <div><h2 className="titulo-competitivo text-xl sm:text-2xl">Encuentra dónde se juega</h2><p className="mt-2 text-xs font-medium">Elige un departamento y explora sus torneos.</p></div>
                <label className="flex items-center gap-2 text-xs font-bold">Departamento
                    <select value={departamento} onChange={e => cambiarDepartamento(e.target.value)} className="max-w-48 rounded-md border border-noche/30 bg-white/80 px-3 py-2.5 text-sm font-medium text-noche focus-visible:outline-noche" disabled={!geojson}>
                        <option value="">Toda Guatemala</option>
                        {geojson?.features.map(f => f.properties.nombre).sort((a,b) => a.localeCompare(b,'es')).map(d => <option key={d}>{d}</option>)}
                    </select>
                </label>
            </div>
            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="zona-oscura relative bg-noche p-3 sm:p-5">
                    <MapaGuatemala torneos={porPeriodo} seleccionado={activo?.id} onSeleccionar={seleccionar} departamento={departamento} onDepartamento={cambiarDepartamento} geojson={geojson} className={portada ? 'h-[380px] sm:h-[440px] lg:h-[470px]' : 'h-[400px] sm:h-[530px]'} />
                    <div className="mt-3 flex flex-wrap justify-between gap-2 px-2 text-[11px] text-tinta-baja">
                        <div className="flex gap-4"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-verde" />SmashGT</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-menta" />start.gg</span></div>
                        <span>Los círculos con número agrupan torneos.</span>
                    </div>
                    {errorGeo && <div role="alert" className="mt-3 flex items-center justify-between gap-3 px-2 text-xs text-pierde"><span>{errorGeo}</span><button onClick={recargarGeo} className="underline">Reintentar</button></div>}
                </div>
                <div className="flex min-w-0 flex-col border-t border-linea bg-panel lg:border-l lg:border-t-0">
                    <div className="border-b border-linea p-5">
                        <div className="flex items-center justify-between gap-2"><h3 className="text-base font-bold">{departamento || 'La agenda'}</h3><span className="cifra text-xs text-menta">{visibles.length} torneos</span></div>
                        <div className="mt-4 flex gap-1 rounded-lg bg-panel-alto p-1" role="group" aria-label="Filtrar torneos por fecha">
                            {[['proximos','Próximos'],['pasados','Pasados'],['todos','Todos']].map(([id,nombre]) => <button type="button" key={id} onClick={() => { setPeriodo(id); setSeleccionado(null); }} aria-pressed={periodo===id} className={`min-h-11 flex-1 rounded-md px-2 text-xs font-semibold ${periodo===id ? 'bg-menta text-noche' : 'text-tinta hover:bg-panel-alto'}`}>{nombre}</button>)}
                        </div>
                    </div>
                    {datos?.error_startgg && <p role="status" className="border-b border-linea px-5 py-3 text-xs leading-5 text-tinta">start.gg no respondió. Mostramos los torneos cargados por SmashGT.</p>}
                    <div className={`min-h-40 overflow-y-auto ${portada ? 'max-h-[405px]' : 'max-h-[465px]'}`}>
                        {cargando && <p role="status" className="p-5 text-sm text-tinta">Buscando torneos…</p>}
                        {error && <div role="alert" className="space-y-3 p-5 text-sm text-tinta"><p>{error}</p><button onClick={recargar} className="boton-menta">Volver a intentar</button></div>}
                        {!cargando && !error && visibles.length===0 && <div className="p-6"><IconoCalendario tam={26} /><p className="mt-4 text-sm font-bold">{departamento ? 'Todavía no hay torneos acá.' : 'No hay torneos en este filtro.'}</p><p className="mt-2 text-xs leading-5 text-tinta">Prueba otra fecha o explora toda Guatemala. Los torneos nuevos aparecen cuando se publican.</p><button type="button" onClick={() => { cambiarDepartamento(''); setPeriodo('todos'); }} className="mt-4 text-sm font-semibold text-menta underline underline-offset-4">Ver todos los torneos</button></div>}
                        {visibles.map(t => <article key={t.id} ref={el => { tarjetas.current[t.id]=el; }} className={`border-b border-linea last:border-b-0 ${activo?.id===t.id ? 'bg-panel-alto' : ''}`}>
                            <button type="button" onClick={() => setSeleccionado(activo?.id===t.id ? null : t.id)} aria-expanded={activo?.id===t.id} className="flex w-full gap-3 p-5 text-left hover:bg-panel-alto">
                                {t.imagen ? <img src={t.imagen} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg bg-noche object-cover" /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-linea text-menta"><IconoCalendario tam={23} /></span>}
                                <span className="min-w-0 flex-1"><span className="block text-sm font-bold leading-5 text-white">{t.nombre}</span><span className="mt-1 block text-xs text-tinta">{fmtFechaCorta(t.fecha)} · {t.lugar?.ciudad || t.departamento || 'Guatemala'}</span><span className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-menta">{t.inscripcion_abierta ? 'Inscripciones abiertas' : t.fuente==='manual' ? 'SmashGT' : 'start.gg'}</span></span>
                            </button>
                            {activo?.id===t.id && <DetalleAnimado className="space-y-3 px-5 pb-5 text-xs leading-5 text-tinta">
                                {t.descripcion && <p>{t.descripcion}</p>}
                                <p className="flex items-start gap-2"><IconoPin tam={16} />{[t.lugar?.nombre,t.lugar?.direccion].filter(Boolean).join(' · ') || t.lugar?.ciudad || 'Ubicación en el mapa'}</p>
                                {t.asistentes>0 && <p>{t.asistentes} asistentes</p>}
                                <div className="flex flex-wrap gap-3">{t.url && <a href={t.url} target="_blank" rel="noreferrer" className="enlace-menta text-xs">Ver torneo <IconoFlecha tam={14} /></a>}{t.lugar?.lat != null && t.lugar?.lng != null && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.lugar.lat},${t.lugar.lng}`)}`} target="_blank" rel="noreferrer" className="text-menta underline underline-offset-4">Cómo llegar</a>}</div>
                            </DetalleAnimado>}
                        </article>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
