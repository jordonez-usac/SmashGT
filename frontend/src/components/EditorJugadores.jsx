import { Fragment, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { Badge, Boton } from './ui';
import { ETIQUETAS_MATCHUP, contarMatchups, tieneDatos, tieneH2H } from '../lib/h2h';
import { SelectorMain } from './Personaje';
import { armarSkin, slugDePersonaje } from '../lib/personajes';
import { IconoChevron, IconoFlechaDir } from '../publico/rotulacion';

const DetalleH2H = ({ jugador }) => {
    const { matchups, matches } = jugador;

    if (!tieneH2H(jugador)) {
        return (
            <p className="text-sm text-amber-300">
                Este jugador no trae head-2-head. Si ya lo tenía guardado, el backend se lo
                devuelve al actualizar en vez de borrarlo.
            </p>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Matches
                </h4>
                {tieneDatos(matches) ? (
                    <dl className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-400">Win rate</dt>
                            <dd className="font-mono">{matches.winRate ?? '—'}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-400">Ganados</dt>
                            <dd className="font-mono text-emerald-300">{matches.wins ?? 0}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-400">Perdidos</dt>
                            <dd className="font-mono text-red-300">{matches.losses ?? 0}</dd>
                        </div>
                    </dl>
                ) : (
                    <p className="text-sm text-slate-500">sin datos</p>
                )}
            </div>

            <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Matchups
                </h4>
                <dl className="space-y-1 text-sm">
                    {Object.entries(ETIQUETAS_MATCHUP).map(([clave, etiqueta]) => {
                        const stat = matchups?.[clave];
                        return (
                            <div key={clave} className="flex justify-between gap-4">
                                <dt className="text-slate-400">{etiqueta}</dt>
                                <dd className="text-right">
                                    {tieneDatos(stat) ? (
                                        <>
                                            <span className="font-mono">{stat.value}</span>
                                            <span className="text-slate-500"> vs </span>
                                            <span className="text-slate-300">{stat.opponent}</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-600">—</span>
                                    )}
                                </dd>
                            </div>
                        );
                    })}
                </dl>
            </div>
        </div>
    );
};

const CAMPOS_EDITABLES = [
    { clave: 'nombre', ancho: 'w-40' },
    { clave: 'team', ancho: 'w-28', placeholder: 'equipo' },
];

function CampoStartgg({ valor, onChange, sugerencias }) {
    const [texto, setTexto] = useState(valor ?? '');
    const [estado, setEstado] = useState({ cargando: false, resuelto: null, error: null, intentado: null });

    useEffect(() => setTexto(valor ?? ''), [valor]);

    const resolver = async () => {
        const limpio = texto.trim();

        if (!limpio) {
            setEstado({ cargando: false, resuelto: null, error: null, intentado: null });
            if (valor) onChange('');
            return;
        }
        if (estado.intentado === limpio || estado.resuelto?.player_id === limpio) return;

        setEstado({ cargando: true, resuelto: null, error: null, intentado: limpio });
        try {
            const resuelto = await api.resolverJugadorStartgg(limpio);
            setEstado({ cargando: false, resuelto, error: null, intentado: limpio });
            onChange(resuelto.player_id);
        } catch (e) {
            setEstado({ cargando: false, resuelto: null, error: e.message, intentado: limpio });
            onChange(limpio);
        }
    };

    return (
        <div className="w-44">
            <input
                value={texto}
                placeholder="1d1a8f8c o id"
                onChange={(e) => setTexto(e.target.value)}
                onBlur={resolver}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="w-full rounded border border-slate-700 bg-slate-900 px-1.5 py-1 placeholder:text-slate-600"
            />
            {estado.cargando && <p className="mt-0.5 text-xs text-slate-500">buscando en start.gg…</p>}
            {estado.resuelto && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-300">
                    {estado.resuelto.avatar && (
                        <img src={estado.resuelto.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                    )}
                    <span className="truncate">
                        {estado.resuelto.prefijo ? `${estado.resuelto.prefijo} | ` : ''}
                        {estado.resuelto.gamerTag}
                    </span>
                </p>
            )}
            {estado.error && <p className="mt-0.5 text-xs text-red-300">{estado.error}</p>}
            {!valor && sugerencias?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                    {sugerencias.map((c) => (
                        <button
                            key={c.player_id}
                            type="button"
                            onClick={() => onChange(c.player_id)}
                            title={`player_id ${c.player_id}`}
                            className="rounded border border-slate-700 px-1.5 py-0.5 text-xs text-slate-300 hover:border-indigo-400"
                        >
                            ¿{c.prefijo ? `${c.prefijo} | ` : ''}{c.gamerTag}? <span className="text-slate-500">{c.torneos} {c.torneos === 1 ? 'torneo' : 'torneos'}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function BotonMain({ playerId, onSkin }) {
    const [estado, setEstado] = useState(null);
    if (!/^\d+$/.test(playerId || '')) return null;

    const detectar = async () => {
        setEstado({ texto: 'buscando…' });
        try {
            const { main } = await api.detectarMainStartgg(playerId);
            if (!main) return setEstado({ texto: 'start.gg no tiene personajes reportados', tono: 'text-amber-300' });
            const slug = slugDePersonaje(main.personaje);
            if (slug) onSkin(armarSkin(slug));
            setEstado(slug
                ? { texto: `${main.personaje} (${main.partidas} games)`, tono: 'text-emerald-300' }
                : { texto: `${main.personaje}: sin retrato en el sitio`, tono: 'text-amber-300' });
        } catch (e) {
            setEstado({ texto: e.message, tono: 'text-red-300' });
        }
    };

    return (
        <div className="mt-1">
            <button type="button" onClick={detectar} disabled={estado?.texto === 'buscando…'} className="text-xs text-indigo-300 hover:text-indigo-200 disabled:opacity-50">
                Detectar main en start.gg
            </button>
            {estado && <p className={`text-xs ${estado.tono || 'text-slate-500'}`}>{estado.texto}</p>}
        </div>
    );
}

const leerAuto = () => {
    try { return localStorage.getItem('smashgt_auto_id') !== 'no'; } catch { return true; }
};

function useBusquedaAutomatica(jugadores, onChange, activa) {
    const [sugerencias, setSugerencias] = useState({});
    const [aviso, setAviso] = useState(null);
    const intentados = useRef(new Set());

    useEffect(() => {
        if (!activa) return;
        const nombres = [...new Set(jugadores.filter((j) => !j.player_id && j.nombre && !intentados.current.has(j.nombre)).map((j) => j.nombre))];
        if (!nombres.length) return;
        nombres.forEach((n) => intentados.current.add(n));
        setAviso(`Buscando ${nombres.length} ids en start.gg…`);
        api.buscarJugadoresStartgg(nombres).then((resultados) => {
            const asignados = {};
            const nuevas = {};
            for (const { nombre, candidatos } of resultados) {
                const exactos = candidatos.filter((c) => c.exacto);
                if (exactos.length === 1) asignados[nombre] = exactos[0].player_id;
                else if (candidatos.length) nuevas[nombre] = candidatos;
            }
            onChange((actuales) => actuales.map((j) => (!j.player_id && asignados[j.nombre] ? { ...j, player_id: asignados[j.nombre] } : j)));
            setSugerencias((s) => ({ ...s, ...nuevas }));
            setAviso(`start.gg: ${Object.keys(asignados).length} ids asignados, ${Object.keys(nuevas).length} con sugerencias, ${nombres.length - Object.keys(asignados).length - Object.keys(nuevas).length} sin coincidencias.`);
        }).catch((e) => {
            nombres.forEach((n) => intentados.current.delete(n));
            setAviso(`No se pudo buscar en start.gg: ${e.message}`);
        });
    }, [jugadores, onChange, activa]);

    return { sugerencias, aviso };
}

export default function EditorJugadores({ jugadores, onChange }) {
    const [expandido, setExpandido] = useState(null);
    const [auto, setAuto] = useState(leerAuto);
    const { sugerencias, aviso } = useBusquedaAutomatica(jugadores, onChange, auto);

    const alternarAuto = (valor) => {
        setAuto(valor);
        try { localStorage.setItem('smashgt_auto_id', valor ? 'si' : 'no'); } catch { /* sin almacenamiento */ }
    };

    const editarCampo = (indice, clave, valor) => {
        onChange((actuales) => actuales.map((j, i) => (i === indice ? { ...j, [clave]: valor } : j)));
    };

    const mover = (indice, direccion) => {
        const destino = indice + direccion;
        if (destino < 0 || destino >= jugadores.length) return;

        const copia = [...jugadores];
        [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
        onChange(copia.map((j, i) => ({ ...j, puesto: i + 1 })));
    };

    const renumerar = () => onChange(jugadores.map((j, i) => ({ ...j, puesto: i + 1 })));

    if (jugadores.length === 0) {
        return (
            <p className="text-sm text-slate-500">
                No hay jugadores cargados. Importa un ranking de Braacket o abre uno guardado.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge tono="neutro">{jugadores.length} jugadores</Badge>
                <Badge tono={jugadores.every(tieneH2H) ? 'ok' : 'alerta'}>
                    {jugadores.filter(tieneH2H).length} con head-2-head
                </Badge>
                <Boton variante="fantasma" onClick={renumerar}>
                    Renumerar puestos 1..n
                </Boton>
                <label className="ml-auto flex items-center gap-2 text-slate-400">
                    <input type="checkbox" checked={auto} onChange={(e) => alternarAuto(e.target.checked)} />
                    Buscar id de start.gg automáticamente
                </label>
            </div>
            {auto && aviso && <p className="text-xs text-slate-500">{aviso}</p>}

            <div className="overflow-x-auto rounded-md border border-slate-800">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-2 py-2">#</th>
                            <th className="px-2 py-2">Main</th>
                            <th className="px-2 py-2">Nombre</th>
                            <th className="px-2 py-2">Team</th>
                            <th className="px-2 py-2">start.gg</th>
                            <th className="px-2 py-2">H2H</th>
                            <th className="px-2 py-2">Orden</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jugadores.map((jugador, i) => {
                            const abierto = expandido === i;
                            const conH2H = tieneH2H(jugador);
                            return (
                                <Fragment key={jugador.braacket_id || jugador.nombre || i}>
                                    <tr className="border-t border-slate-800 hover:bg-slate-900/40">
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="number"
                                                value={jugador.puesto ?? ''}
                                                onChange={(e) => editarCampo(i, 'puesto', Number(e.target.value))}
                                                className="w-14 rounded border border-slate-700 bg-slate-900 px-1.5 py-1 font-mono"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <SelectorMain
                                                skin={jugador.skin}
                                                onChange={(valor) => editarCampo(i, 'skin', valor)}
                                            />
                                            <BotonMain playerId={jugador.player_id} onSkin={(valor) => editarCampo(i, 'skin', valor)} />
                                        </td>
                                        {CAMPOS_EDITABLES.map(({ clave, ancho, placeholder }) => (
                                            <td key={clave} className="px-2 py-1.5">
                                                <input
                                                    value={jugador[clave] ?? ''}
                                                    placeholder={placeholder}
                                                    onChange={(e) => editarCampo(i, clave, e.target.value)}
                                                    className={`${ancho} rounded border border-slate-700 bg-slate-900 px-1.5 py-1
                                                        placeholder:text-slate-600`}
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1.5">
                                            <CampoStartgg
                                                valor={jugador.player_id}
                                                sugerencias={auto ? sugerencias[jugador.nombre] : null}
                                                onChange={(v) => editarCampo(i, 'player_id', v)}
                                            />
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <button
                                                onClick={() => setExpandido(abierto ? null : i)}
                                                className="flex items-center gap-1.5"
                                                title="Ver head-2-head"
                                            >
                                                <Badge tono={conH2H ? 'ok' : 'alerta'}>
                                                    {conH2H ? `${contarMatchups(jugador.matchups)}/5` : 'sin h2h'}
                                                </Badge>
                                                <span className="text-slate-500"><IconoChevron arriba={abierto} /></span>
                                            </button>
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <div className="flex gap-1">
                                                <Boton
                                                    variante="fantasma"
                                                    onClick={() => mover(i, -1)}
                                                    disabled={i === 0}
                                                    className="px-2 py-0.5"
                                                    aria-label="Subir"
                                                >
                                                    <IconoFlechaDir dir={270} tam={14} />
                                                </Boton>
                                                <Boton
                                                    variante="fantasma"
                                                    onClick={() => mover(i, 1)}
                                                    disabled={i === jugadores.length - 1}
                                                    className="px-2 py-0.5"
                                                    aria-label="Bajar"
                                                >
                                                    <IconoFlechaDir dir={90} tam={14} />
                                                </Boton>
                                            </div>
                                        </td>
                                    </tr>
                                    {abierto && (
                                        <tr className="border-t border-slate-800 bg-slate-950/60">
                                            <td colSpan={7} className="px-4 py-3">
                                                <div className="mb-2 flex flex-wrap gap-3 font-mono text-xs text-slate-500">
                                                    <span>braacket_id: {jugador.braacket_id || '—'}</span>
                                                    <span>url_perfil: {jugador.url_perfil || '—'}</span>
                                                </div>
                                                <DetalleH2H jugador={jugador} />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
