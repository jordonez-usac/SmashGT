import { useEffect, useRef } from 'react';
import { animate } from 'motion/mini';

export function useScrollEntrada(ruta) {
    const ref = useRef(null);
    useEffect(() => {
        const raiz = ref.current;
        if (!raiz) return;
        const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)');
        const vistos = new WeakSet();
        const controles = new Map();
        const limpiar = () => {
            controles.forEach((control, elemento) => {
                control.cancel();
                for (const propiedad of ['transform', 'opacity', 'clip-path']) elemento.style.removeProperty(propiedad);
            });
            controles.clear();
        };
        const observador = new IntersectionObserver(entradas => {
            for (const entrada of entradas) {
                if (!entrada.isIntersecting) continue;
                const elemento = entrada.target;
                observador.unobserve(elemento);
                if (preferencia.matches) continue;
                const titulo = elemento.dataset.scroll === 'titulo';
                const control = animate(elemento, titulo
                    ? { opacity: [.15, 1], clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }
                    : { opacity: [.08, 1], transform: ['translateY(52px)', 'translateY(0px)'] },
                { duration: titulo ? .65 : .7, delay: Number(elemento.dataset.demora || 0), ease: [.22, 1, .36, 1] });
                controles.set(elemento, control);
            }
        }, { threshold: .2, rootMargin: '0px 0px -35px 0px' });
        const registrar = () => {
            raiz.querySelectorAll('[data-scroll]').forEach(elemento => {
                if (vistos.has(elemento)) return;
                vistos.add(elemento);
                observador.observe(elemento);
            });
        };
        const visibilidad = new IntersectionObserver(entradas => {
            for (const { target, isIntersecting } of entradas) {
                if (isIntersecting) delete target.dataset.fuera; else target.dataset.fuera = '';
            }
        }, { rootMargin: '200px 0px' });
        const vigilados = new WeakSet();
        const registrarVisibilidad = () => raiz.querySelectorAll('[data-scroll="jugador"], [data-scroll="tarjeta"]').forEach(elemento => {
            if (vigilados.has(elemento)) return;
            vigilados.add(elemento);
            visibilidad.observe(elemento);
        });
        registrar();
        registrarVisibilidad();
        const cambios = new MutationObserver(() => { registrar(); registrarVisibilidad(); });
        cambios.observe(raiz, { childList: true, subtree: true });
        preferencia.addEventListener('change', limpiar);
        return () => { observador.disconnect(); visibilidad.disconnect(); cambios.disconnect(); limpiar(); preferencia.removeEventListener('change', limpiar); };
    }, [ruta]);
    return ref;
}
