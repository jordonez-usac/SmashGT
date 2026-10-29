import { useEffect, useState } from 'react';
import { CONFIG_INICIAL, ESCENARIOS, estadoSet, nombreEscenario } from '../lib/baneo';
import { Titulo } from './piezas';
import { IconoCerrar, SmashBall } from './rotulacion';

const CLAVE = 'smashgt-baneo';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { return {}; } };
const plural = (n, palabra) => `${n} ${palabra}${n === 1 ? '' : 's'}`;

function Escenario({ escenario, estado, quien, nombre, onClick }) {
    const activo = estado === 'activo';
    return (
        <button type="button" disabled={!activo} onClick={onClick} className={`escenario ${estado}`} style={quien !== undefined ? { '--lado': `var(--lado-${quien})` } : undefined}
            aria-label={`${escenario.nombre}${estado === 'quitado' ? `, quitado por ${nombre(quien)}` : estado === 'bloqueado' ? ', bloqueado por DSR' : ''}`}>
            <img src={escenario.imagen} alt="" loading="lazy" />
            <span className="escenario-nombre">{escenario.nombre}</span>
            {estado === 'quitado' && <span className="escenario-marca"><IconoCerrar tam={12} />{nombre(quien)}</span>}
            {estado === 'bloqueado' && <span className="escenario-marca neutra">DSR</span>}
        </button>
    );
}

export default function Baneo() {
    const [config, setConfig] = useState(() => {
        const c = { ...CONFIG_INICIAL, ...leer().config };
        const existe = slug => ESCENARIOS.some(e => e.slug === slug);
        return { ...c, iniciales: c.iniciales.filter(existe), counterpicks: c.counterpicks.filter(existe) };
    });
    const [acciones, setAcciones] = useState(() => leer().acciones || []);
    useEffect(() => { try { localStorage.setItem(CLAVE, JSON.stringify({ config, acciones })); } catch { /* sin almacenamiento: el set vive solo en memoria */ } }, [config, acciones]);

    const s = estadoSet(config, acciones);
    const agregar = accion => setAcciones(prev => [...prev, accion]);
    const cambiarReglas = cambios => { setConfig(c => ({ ...c, ...cambios })); setAcciones([]); };
    const nombre = i => config.nombres[i]?.trim() || `Jugador ${i + 1}`;
    const rolDe = slug => config.iniciales.includes(slug) ? 'inicial' : config.counterpicks.includes(slug) ? 'counterpick' : 'fuera';
    const cambiarRol = (slug, rol) => cambiarReglas({
        iniciales: rol === 'inicial' ? [...config.iniciales.filter(e => e !== slug), slug] : config.iniciales.filter(e => e !== slug),
        counterpicks: rol === 'counterpick' ? [...config.counterpicks.filter(e => e !== slug), slug] : config.counterpicks.filter(e => e !== slug),
    });

    const elegir = slug => {
        if (s.fase === 'pick') agregar({ tipo: 'elegir', escenario: slug });
        else agregar({ tipo: 'quitar', escenario: slug, jugador: s.turno });
    };
    const estadoDe = slug => {
        if (s.quitados.includes(slug)) return 'quitado';
        if (s.bloqueados.includes(slug)) return 'bloqueado';
        if (s.fase === 'jugando') return slug === s.escenario ? 'elegido' : 'apagado';
        return ['strike', 'ban', 'pick'].includes(s.fase) ? 'activo' : 'apagado';
    };

    const instruccion = {
        primero: ['¿Quién elimina primero?', 'Lo normal es decidirlo con piedra, papel o tijera.'],
        strike: [`${nombre(s.turno)}: elimina ${plural(s.pendientes, 'escenario')}`, 'Game 1 · Se eliminan escenarios iniciales por turnos hasta que quede uno.'],
        ban: [`${nombre(s.turno)}: banea ${plural(s.pendientes, 'escenario')}`, `Ganó el game anterior. Después, ${nombre(1 - s.turno)} elige dónde se juega.`],
        pick: [`${nombre(s.turno)}: elige el escenario`, s.bloqueados.length ? 'Los marcados con DSR no se pueden elegir: ya ganaste ahí en este set.' : 'Perdiste el game anterior, así que eliges dónde se juega.'],
        jugando: [`Game ${s.juego} en ${nombreEscenario(s.escenario)}`, '¿Quién ganó?'],
        fin: [`${nombre(s.campeon)} gana el set ${s.marcador[s.campeon]}-${s.marcador[1 - s.campeon]}`, 'GG. Pueden empezar otro set con las mismas reglas.'],
    }[s.fase];

    return (
        <div className="baneo">
            <Titulo>Baneo de stages</Titulo>
            <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-tinta">Hagan el striking del game 1 y los baneos de cada counterpick desde un solo celular. Las reglas se pueden ajustar al torneo.</p>

            <div className="baneo-formato" role="group" aria-label="Formato del set">
                {[3, 5].map(n => <button key={n} type="button" aria-pressed={config.mejorDe === n} onClick={() => setConfig(c => ({ ...c, mejorDe: n }))}>
                    <span className="titulo-competitivo">Bo{n}</span><span>Al mejor de {n}</span>
                </button>)}
            </div>

            <div className="baneo-marcador superficie">
                {[0, 1].map(i => <label key={i} className={`baneo-jugador ${s.turno === i ? 'en-turno' : ''} ${i ? 'derecha' : ''}`} style={{ '--lado': `var(--lado-${i})` }}>
                    <span className="sr-only">Nombre del jugador {i + 1}</span>
                    <input value={config.nombres[i]} maxLength={24} onChange={e => setConfig(c => ({ ...c, nombres: c.nombres.map((n, j) => j === i ? e.target.value : n) }))} className="baneo-nombre" />
                    <span className="titulo-competitivo cifra baneo-puntos">{s.marcador[i]}</span>
                </label>)}
                <span className="baneo-mejor-de">Game {s.juego} · Gana con {Math.ceil(config.mejorDe / 2)}</span>
            </div>

            <div className="baneo-instruccion" style={s.turno !== null ? { '--lado': `var(--lado-${s.turno})` } : undefined} aria-live="polite">
                <p className="titulo-competitivo text-2xl sm:text-3xl">{instruccion[0]}</p>
                <p className="mt-2 text-sm text-tinta">{instruccion[1]}</p>
                {s.fase === 'primero' && <div className="mt-4 flex flex-wrap gap-2">
                    {[0, 1].map(i => <button key={i} type="button" onClick={() => agregar({ tipo: 'primero', jugador: i })} className="baneo-boton" style={{ '--lado': `var(--lado-${i})` }}>{nombre(i)}</button>)}
                    <button type="button" onClick={() => agregar({ tipo: 'primero', jugador: Math.round(Math.random()) })} className="accion-secundaria">Sortear</button>
                </div>}
                {s.fase === 'jugando' && <div className="mt-4 flex flex-wrap gap-2">
                    {[0, 1].map(i => <button key={i} type="button" onClick={() => agregar({ tipo: 'ganador', jugador: i })} className="baneo-boton" style={{ '--lado': `var(--lado-${i})` }}>Ganó {nombre(i)}</button>)}
                </div>}
                {s.fase === 'fin' && <button type="button" onClick={() => setAcciones([])} className="boton-menta mt-4"><SmashBall tam={16} />Nuevo set</button>}
            </div>

            {config.iniciales.length === 0
                ? <p className="superficie p-5 text-sm text-tinta">Marca al menos un escenario como inicial en las reglas.</p>
                : s.fase !== 'fin' && <div className="space-y-5">
                    {[['Iniciales', config.iniciales, null], ['Counterpicks', config.counterpicks, s.juegos.length ? null : 'Se habilitan desde el game 2']].filter(([, slugs]) => slugs.length).map(([titulo, slugs, nota]) => <section key={titulo} aria-label={titulo}>
                        <h2 className="baneo-grupo">{titulo}{nota && <span>{nota}</span>}</h2>
                        <div className="baneo-grilla">
                            {slugs.map(slug => ESCENARIOS.find(e => e.slug === slug)).filter(Boolean).map(e => {
                                const estado = nota ? 'apagado' : estadoDe(e.slug);
                                return <Escenario key={e.slug} escenario={e} estado={estado} quien={estado === 'quitado' ? s.quitadosPor[e.slug] : estado === 'activo' ? s.turno : undefined} nombre={nombre} onClick={() => elegir(e.slug)} />;
                            })}
                        </div>
                    </section>)}
                </div>}

            <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={!acciones.length} onClick={() => setAcciones(a => a.slice(0, -1))} className="baneo-control">Deshacer</button>
                <button type="button" disabled={!acciones.length} onClick={() => setAcciones([])} className="baneo-control">Reiniciar set</button>
            </div>

            {s.juegos.length > 0 && <ol className="baneo-historial superficie mt-6">
                {s.juegos.map((j, i) => <li key={i} style={{ '--lado': `var(--lado-${j.ganador})` }}>
                    <span className="cifra font-bold">G{i + 1}</span><span className="min-w-0 flex-1 truncate">{nombreEscenario(j.escenario)}</span><span className="baneo-ganador">{nombre(j.ganador)}</span>
                </li>)}
            </ol>}

            <details className="superficie mt-6 p-4">
                <summary className="-my-2 cursor-pointer py-2 font-bold text-white">Reglas del set</summary>
                <p className="mt-2 text-xs text-tinta-baja">Ajústalas a las del torneo. Cambiarlas reinicia el set en curso.</p>

                <div className="baneo-ajustes">
                    <div>
                        <p className="baneo-ajuste-titulo">Baneos del ganador</p>
                        <p className="baneo-ajuste-ayuda">Desde el game 2, cuántos escenarios banea quien ganó el game anterior.</p>
                        <div className="baneo-segmentos" role="group" aria-label="Baneos del ganador">
                            {[1, 2, 3, 4].map(n => <button key={n} type="button" aria-pressed={config.baneos === n} onClick={() => cambiarReglas({ baneos: n })}>{n}</button>)}
                        </div>
                    </div>
                    <label className="baneo-dsr">
                        <input type="checkbox" checked={config.dsr} onChange={e => cambiarReglas({ dsr: e.target.checked })} />
                        <span><span className="baneo-ajuste-titulo">DSR</span><span className="baneo-ajuste-ayuda">Quien elige no puede volver a un escenario donde ya ganó en el set.</span></span>
                    </label>
                </div>

                <p className="baneo-ajuste-titulo mt-6">Lista de escenarios</p>
                <p className="baneo-ajuste-ayuda">
                    <strong>{config.iniciales.length} {config.iniciales.length === 1 ? 'inicial' : 'iniciales'}</strong> (striking del game 1) · <strong>{plural(config.counterpicks.length, 'counterpick')}</strong> (se suman desde el game 2)
                    {config.iniciales.length % 2 === 0 && config.iniciales.length > 0 && <span className="baneo-aviso"> · Lo normal es un número impar de iniciales.</span>}
                </p>
                <ul className="baneo-roles">
                    {ESCENARIOS.map(e => {
                        const rol = rolDe(e.slug);
                        return <li key={e.slug} className={`baneo-rol ${rol}`}>
                            <div className="baneo-rol-imagen"><img src={e.imagen} alt="" loading="lazy" /><span>{e.nombre}</span></div>
                            <div className="baneo-segmentos" role="group" aria-label={`Uso de ${e.nombre}`}>
                                {[['inicial', 'Inicial'], ['counterpick', 'Counter'], ['fuera', 'Fuera']].map(([valor, texto]) => <button key={valor} type="button" aria-pressed={rol === valor} onClick={() => cambiarRol(e.slug, valor)}>{texto}</button>)}
                            </div>
                        </li>;
                    })}
                </ul>
                <button type="button" onClick={() => cambiarReglas({ ...CONFIG_INICIAL, nombres: config.nombres })} className="enlace-menta mt-4">Volver a las reglas por defecto</button>
            </details>
        </div>
    );
}
