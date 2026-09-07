import { useEffect, useRef } from 'react';
import { animate } from 'motion/mini';

export function useMovimiento(clave, tipo = 'revelar') {
    const ref = useRef(null);
    useEffect(() => {
        const elemento = tipo === 'seleccion' ? ref.current?.querySelector('[aria-current="page"]') : ref.current;
        const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!elemento || preferencia.matches) return;
        const controles = animate(elemento, tipo === 'seleccion'
            ? { scale: [.9, 1] }
            : { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], opacity: [.7, 1] },
        { duration: .18, ease: [.16, 1, .3, 1] });
        const detener = () => {
            controles.cancel();
            for (const propiedad of tipo === 'seleccion' ? ['scale'] : ['clip-path', 'opacity']) elemento.style.removeProperty(propiedad);
        };
        preferencia.addEventListener('change', detener);
        return () => { detener(); preferencia.removeEventListener('change', detener); };
    }, [clave, tipo]);
    return ref;
}
