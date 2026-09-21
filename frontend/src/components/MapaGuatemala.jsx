import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { VISTA, aPaths, desproyectar } from '../lib/proyeccion';
import { IconoMas, IconoMenos } from '../publico/rotulacion';
import { agruparTorneos, cajaDepartamento, cargarGeografia, departamentoDe } from '../lib/mapa';

const teclado = (e, accion) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); accion(); } };
const limite = (v, min, max) => Math.max(min, Math.min(max, v));
const VISTA_INICIAL = { x: 0, y: 0, ancho: VISTA.ancho, alto: VISTA.alto };

export default function MapaGuatemala({ torneos = [], seleccionado = null, onSeleccionar, onElegirPunto = null, departamento = '', onDepartamento, geojson: geografia, className = '' }) {
    const [geojson, setGeojson] = useState(geografia || null);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);
    const [encima, setEncima] = useState(null);
    const [vista, setVista] = useState(VISTA_INICIAL);
    const [tamano, setTamano] = useState({ ancho: VISTA.ancho, alto: VISTA.alto });
    const svg = useRef(null);
    const arrastre = useRef(null);
    const movido = useRef(false);
    const patron = useId().replace(/:/g, '');
    const escala = VISTA.ancho / vista.ancho;
    const factorPantalla = Math.max(.01, Math.min(tamano.ancho / VISTA.ancho, tamano.alto / VISTA.alto));
    const unidadPin = 1 / (escala * factorPantalla);
    useEffect(() => {
        if (!svg.current) return;
        const observador = new ResizeObserver(([entrada]) => setTamano({ ancho: entrada.contentRect.width, alto: entrada.contentRect.height }));
        observador.observe(svg.current);
        return () => observador.disconnect();
    }, [geojson]);
    useEffect(() => {
        let vigente = true;
        if (geografia) { setGeojson(geografia); return; }
        setError(null);
        cargarGeografia().then(g => { if (vigente) setGeojson(g); }).catch(e => { if (vigente) setError(e.message); });
        return () => { vigente = false; };
    }, [geografia, intento]);
    const departamentos = useMemo(() => geojson ? aPaths(geojson).map((d,i) => ({ ...d, caja: cajaDepartamento(geojson.features[i]) })) : [], [geojson]);
    const grupos = useMemo(() => agruparTorneos(torneos, escala, factorPantalla), [torneos, escala, factorPantalla]);
    const conteos = useMemo(() => {
        const c = {};
        for (const t of torneos) { const d = departamentoDe(t.lugar, geojson); if (d) c[d] = (c[d] || 0) + 1; }
        return c;
    }, [torneos, geojson]);

    const encuadrar = (caja) => {
        const proporcion = VISTA.ancho / VISTA.alto;
        const alto = Math.max(caja.alto * 1.25, caja.ancho * 1.25 / proporcion, VISTA.alto / 6);
        setVista({ x: caja.x + caja.ancho / 2 - alto * proporcion / 2, y: caja.y + caja.alto / 2 - alto / 2, ancho: alto * proporcion, alto });
    };
    useEffect(() => {
        const d = departamentos.find(d => d.nombre === departamento);
        if (d) encuadrar(d.caja);
        else if (!departamento) setVista(VISTA_INICIAL);
    }, [departamento, departamentos]);

    const zoom = (factor, centro = null) => setVista(v => {
        const nuevaEscala = limite(VISTA.ancho / v.ancho * factor, 1, 6);
        const ancho = VISTA.ancho / nuevaEscala, alto = VISTA.alto / nuevaEscala;
        const cx = centro?.x ?? v.x + v.ancho / 2, cy = centro?.y ?? v.y + v.alto / 2;
        return { x: cx - ancho / 2, y: cy - alto / 2, ancho, alto };
    });
    const coordenada = (e) => {
        const p = svg.current.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
        return p.matrixTransform(svg.current.getScreenCTM().inverse());
    };
    const elegirPunto = (e) => {
        if (movido.current || !onElegirPunto) return;
        const p = coordenada(e), lugar = desproyectar(p.x, p.y);
        const depto = departamentoDe(lugar, geojson);
        if (depto) onElegirPunto({ ...lugar, departamento: depto });
    };
    const activarGrupo = (g) => {
        if (movido.current) return;
        if (g.torneos.length > 1) zoom(2, g);
        else onSeleccionar?.(g.torneos[0]);
    };
    const moverConTeclado = (e) => {
        if (e.target !== e.currentTarget) return;
        const desplazamientos = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] };
        if (desplazamientos[e.key]) {
            e.preventDefault(); const [dx,dy] = desplazamientos[e.key];
            setVista(v => ({ ...v, x: v.x + dx * v.ancho / 8, y: v.y + dy * v.alto / 8 }));
        }
        if (e.key === '+') zoom(1.5);
        if (e.key === '-') zoom(1 / 1.5);
    };
    return (
        <div className={`relative flex flex-col overflow-hidden rounded-xl bg-noche ${className}`}>
            <div className="absolute right-3 top-3 z-10 flex gap-1.5" role="group" aria-label="Controles del mapa">
                <button type="button" className="map-control" aria-label="Acercar mapa" onClick={() => zoom(1.5)} disabled={escala >= 6}><IconoMas tam={19} /></button>
                <button type="button" className="map-control" aria-label="Alejar mapa" onClick={() => zoom(1 / 1.5)} disabled={escala <= 1}><IconoMenos tam={19} /></button>
                <button type="button" className="map-control" aria-label="Ver toda Guatemala" onClick={() => { setVista(VISTA_INICIAL); onDepartamento?.(''); }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg></button>
            </div>
            {error ? <div role="alert" className="grid flex-1 place-content-center gap-3 p-6 text-center text-sm text-tinta"><p>{error}</p><button className="boton-menta" onClick={() => setIntento(i => i+1)}>Volver a cargar</button></div> : !geojson ? <p role="status" className="grid flex-1 place-items-center py-24 text-sm text-tinta">Cargando Guatemala…</p> : (
                <svg ref={svg} viewBox={`${vista.x} ${vista.y} ${vista.ancho} ${vista.alto}`} className={`map-svg min-h-0 w-full flex-1 ${onElegirPunto ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`} aria-label="Mapa interactivo de Guatemala. Usa los controles para acercar o las flechas para mover." tabIndex={0} onKeyDown={moverConTeclado}
                    onPointerDown={e => { if (e.button !== 0) return; movido.current = false; arrastre.current = { x: e.clientX, y: e.clientY, vista }; }}
                    onPointerMove={e => {
                        const a = arrastre.current; if (!a) return;
                        const dx = e.clientX-a.x, dy = e.clientY-a.y;
                        if (Math.hypot(dx,dy) < 5 && !movido.current) return;
                        movido.current = true; svg.current.setPointerCapture(e.pointerId);
                        const p = svg.current.createSVGPoint(); p.x=a.x; p.y=a.y;
                        const inicio=p.matrixTransform(svg.current.getScreenCTM().inverse());
                        const fin=coordenada(e);
                        setVista(v => ({ ...v, x: limite(v.x + inicio.x-fin.x, -v.ancho / 2, VISTA.ancho - v.ancho / 2), y: limite(v.y + inicio.y-fin.y, -v.alto / 2, VISTA.alto - v.alto / 2) }));
                        arrastre.current = { x: e.clientX, y: e.clientY };
                    }} onPointerUp={() => { arrastre.current=null; }} onPointerCancel={() => { arrastre.current=null; }} onClick={elegirPunto} onMouseLeave={() => setEncima(null)}>
                    <defs><pattern id={patron} width="45" height="45" patternUnits="userSpaceOnUse"><circle cx="22" cy="22" r="1.5" fill="#31556b" opacity=".65" /></pattern></defs>
                    <rect x={vista.x} y={vista.y} width={vista.ancho} height={vista.alto} fill={`url(#${patron})`} />
                    {departamentos.map(d => {
                        const activo = d.nombre === departamento, hover = d.nombre === encima;
                        const elegir = () => { if (!movido.current && !onElegirPunto) onDepartamento?.(activo ? '' : d.nombre); };
                        return <g key={d.nombre}>
                            <path d={d.d} fill={activo ? '#9efbf2' : hover ? '#7bdac9' : conteos[d.nombre] ? '#5cbaaa' : d.color} stroke="#081d30" strokeWidth={2 / escala} strokeLinejoin="round" role={onDepartamento && !onElegirPunto ? 'button' : undefined} tabIndex={onDepartamento && !onElegirPunto ? 0 : undefined} aria-label={`${d.nombre}: ${conteos[d.nombre] || 0} torneos`} aria-pressed={onDepartamento ? activo : undefined} onMouseEnter={() => setEncima(d.nombre)} onClick={elegir} onKeyDown={e => teclado(e,() => { movido.current = false; elegir(); })}><title>{d.nombre} · {conteos[d.nombre] || 0} torneos</title></path>
                            {escala >= 2 && <text x={d.caja.x+d.caja.ancho/2} y={d.caja.y+d.caja.alto/2} className="map-label" style={{ fontSize: 13 / escala, strokeWidth: 4 / escala }}>{d.nombre}</text>}
                        </g>;
                    })}
                    {grupos.map((g) => {
                        const activo=g.torneos.some(t => t.id === seleccionado), multiple=g.torneos.length>1;
                        const color=activo ? '#fff' : g.torneos[0].fuente==='manual' ? '#40dbb2' : '#9efbf2';
                        return <g key={g.torneos.map(t => t.id).join('-')} role="button" tabIndex={0} aria-label={multiple ? `Acercar grupo de ${g.torneos.length} torneos` : `Ver ${g.torneos[0].nombre}`} onClick={e => { e.stopPropagation(); activarGrupo(g); }} onKeyDown={e => teclado(e,() => { movido.current = false; activarGrupo(g); })} className="cursor-pointer">
                            <circle cx={g.x} cy={g.y} r={22 * unidadPin} fill="transparent" />
                            <circle cx={g.x} cy={g.y} r={(multiple ? 16 : 8) * unidadPin} fill={color} stroke="#081d30" strokeWidth={2 * unidadPin} />
                            {multiple ? <text x={g.x} y={g.y} dy={4 * unidadPin} fontSize={12 * unidadPin} textAnchor="middle" fill="#081d30" fontWeight="800" pointerEvents="none">{g.torneos.length}</text> : <circle cx={g.x} cy={g.y} r={2.5 * unidadPin} fill="#081d30" pointerEvents="none" />}
                            {activo && <circle cx={g.x} cy={g.y} r={13 * unidadPin} fill="none" stroke="#fff" strokeWidth={2 * unidadPin} pointerEvents="none" />}
                            <title>{multiple ? `${g.torneos.length} torneos cerca. Acerca para verlos.` : g.torneos[0].nombre}</title>
                        </g>;
                    })}
                </svg>
            )}
            <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-t border-linea px-4 py-3 text-xs text-tinta">
                <span aria-live="polite">{encima || departamento || 'Guatemala'}{(encima || departamento) && ` · ${conteos[encima || departamento] || 0} torneos`}</span>
                <span>{onElegirPunto ? 'Toca un departamento para ubicar el torneo' : 'Arrastra para mover · + para acercar'}</span>
            </div>
        </div>
    );
}
