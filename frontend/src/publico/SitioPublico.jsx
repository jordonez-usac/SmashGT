import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { IconoCerrar, IconoFlecha, IconoMenu } from './rotulacion';
import { useMovimiento } from '../lib/movimiento';
import FondoVivo from './FondoVivo';
import { useScrollEntrada } from '../lib/useScrollEntrada';

const enlaces = [{ a: '/', texto: 'Inicio', exacto: true }, { a: '/ranking', texto: 'Ranking' }, { a: '/jugadores', texto: 'Jugadores' }, { a: '/torneos', texto: 'Torneos' }, { a: '/resultados', texto: 'Resultados' }, { a: '/noticias', texto: 'Noticias' }, { a: '/guia', texto: 'Guía' }];
function IconoNav({ tipo }) {
    const trazos = {
        Inicio: 'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',
        Ranking: 'M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8',
        Torneos: 'M8 3v4m8-4v4M4 10h16M4 5h16v16H4V5Zm4 9h3m2 0h3m-8 4h3',
        Noticias: 'M4 4h16v16H4V4Zm4 4h8m-8 4h8m-8 4h5',
        Admin: 'M12 3 4 6v6c0 4 8 9 8 9s8-5 8-9V6l-8-3Zm-3 9 2 2 4-4',
        Jugadores: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7M18 14a7 7 0 0 1 4 7',
        Resultados: 'M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4Zm3 13h4l-1-3h-2l-1 3Z',
        Guía: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 16a2 2 0 0 1 2-2h13v2H6M9 7h6',
    };
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={trazos[tipo]} /></svg>;
}
const REDES = [
    ['WhatsApp', import.meta.env.VITE_REDES_WHATSAPP, 'M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20Zm5-11c0 3 3 6 6 6l1.5-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2L9 9Z'],
    ['Discord', import.meta.env.VITE_REDES_DISCORD, 'M7 6c2-1 3.5-1 5-1s3 0 5 1c1.5 2 2.5 5 2.5 9-1.5 1.5-3 2-4 2l-1-2m-7 0-1 2c-1 0-2.5-.5-4-2 0-4 1-7 2.5-9M8 15c2.5 1 5.5 1 8 0M9.5 11.5h0m5 0h0'],
    ['Instagram', import.meta.env.VITE_REDES_INSTAGRAM, 'M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm8 7.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 7h0'],
    ['Facebook', import.meta.env.VITE_REDES_FACEBOOK, 'M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2V3Z'],
    ['TikTok', import.meta.env.VITE_REDES_TIKTOK, 'M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.5'],
].filter(([, url]) => url);

const temaInicial = () => document.documentElement.dataset.tema || 'oscuro';

function BotonTema({ tema, setTema }) {
    const cambiar = evento => {
        const siguiente = tema === 'oscuro' ? 'claro' : 'oscuro';
        const aplicar = () => {
            document.documentElement.dataset.tema = siguiente;
            try { localStorage.setItem('smashgt_tema', siguiente); } catch { /* sin almacenamiento */ }
            flushSync(() => setTema(siguiente));
        };
        if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return aplicar();
        const caja = evento.currentTarget.getBoundingClientRect();
        const x = caja.left + caja.width / 2, y = caja.top + caja.height / 2;
        const radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        document.startViewTransition(aplicar).ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
                { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
            );
        });
    };
    const oscuro = tema === 'oscuro';
    return <button type="button" onClick={cambiar} aria-pressed={oscuro} aria-label={oscuro ? 'Usar modo claro' : 'Usar modo oscuro'} title={oscuro ? 'Modo claro' : 'Modo oscuro'} className="boton-tema">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <mask id="tema-luna"><rect width="24" height="24" fill="#fff" /><circle className="tema-mordida" cx="24" cy="4" r="7" fill="#000" /></mask>
            <circle className="tema-astro" cx="12" cy="12" r="5" mask="url(#tema-luna)" fill="currentColor" />
            <g className="tema-rayos"><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></g>
        </svg>
    </button>;
}

export default function SitioPublico() {
    const { pathname } = useLocation();
    const navegacion = useMovimiento(pathname, 'seleccion');
    const contenido = useScrollEntrada(pathname);
    const [tema, setTema] = useState(temaInicial);
    const menu = useRef(null);
    useEffect(() => { menu.current?.close(); }, [pathname]);
    const claseEnlace = ({ isActive }) => `enlace-nav flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${isActive ? 'nav-activo' : 'text-tinta hover:bg-panel-alto hover:text-white'}`;
    return (
        <div className="sitio-publico min-h-screen bg-canvas">
            <FondoVivo />
            <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-menta focus:p-3 focus:text-noche">Saltar al contenido</a>
            <header className="cabecera border-b border-linea">
                <nav aria-label="Navegación principal" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                    <Link to="/" className="flex items-center gap-3" aria-label="SmashGT, ir al inicio">
                        <span className="marca-gt titulo-competitivo text-3xl">Smash<span className="marca-bandera">GT</span></span>
                    </Link>
                    <div ref={navegacion} className="nav-enlaces hidden gap-0.5 rounded-xl border border-linea p-1 lg:flex">
                        {enlaces.map(({ a, texto, exacto }) => <NavLink key={a} to={a} end={exacto} className={claseEnlace}><IconoNav tipo={texto} />{texto}</NavLink>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/admin" className="hidden min-h-11 items-center gap-2 rounded-lg border border-linea bg-panel px-3 text-xs font-semibold text-tinta hover:border-menta hover:text-menta lg:flex" aria-label="Panel admin"><IconoNav tipo="Admin" /><span className="hidden xl:inline">Panel admin</span></Link>
                        <BotonTema tema={tema} setTema={setTema} />
                        <div className="lg:hidden"><button type="button" onClick={() => menu.current?.showModal()} aria-label="Abrir menú" className="boton-tema"><IconoMenu tam={20} /></button></div>
                    </div>
                </nav>
            </header>
            <dialog ref={menu} aria-label="Menú" className="menu-lateral" onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
                <div className="flex h-full flex-col gap-2 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="marca-gt titulo-competitivo text-2xl">Smash<span className="marca-bandera">GT</span></span>
                        <button type="button" onClick={() => menu.current?.close()} aria-label="Cerrar menú" className="boton-tema"><IconoCerrar tam={20} /></button>
                    </div>
                    {enlaces.map(({ a, texto, exacto }, i) => <NavLink key={a} to={a} end={exacto} style={{ '--i': i }} className={claseEnlace}><IconoNav tipo={texto} />{texto}</NavLink>)}
                    <Link to="/admin" style={{ '--i': enlaces.length }} className="enlace-nav mt-auto flex min-h-11 items-center gap-2 rounded-lg border border-linea px-4 text-sm font-semibold text-tinta hover:border-menta hover:text-menta"><IconoNav tipo="Admin" />Panel admin</Link>
                </div>
            </dialog>
            <main ref={contenido} id="contenido" className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"><Outlet /></main>
            <footer className="mt-20 border-t border-linea">
                <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-5 py-10 sm:px-8">
                    <div><p className="titulo-competitivo text-xl text-menta">SmashGT</p><p className="mt-2 text-sm text-tinta">La escena de Smash en Guatemala.</p></div>
                    <div className="max-w-md text-xs leading-6 text-tinta-baja">
                        {REDES.length > 0 && <div className="mb-4"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-menta">Únete a la comunidad</p><div className="redes flex flex-wrap gap-2">{REDES.map(([nombre, url, trazo]) => <a key={nombre} href={url} target="_blank" rel="noreferrer" aria-label={nombre} title={nombre}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={trazo} /></svg></a>)}</div></div>}
                        <p>Rankings de Braacket. Torneos y perfiles de <a href="https://start.gg" target="_blank" rel="noreferrer" className="underline underline-offset-4">start.gg</a>.</p>
                        <p>Límites de <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer" className="underline underline-offset-4">geoBoundaries</a> (OpenStreetMap, ODbL).</p>
                        <Link to="/torneos" className="enlace-menta mt-3">Encuentra tu próximo torneo <IconoFlecha tam={15} /></Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
