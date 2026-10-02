import { useEffect, useState } from 'react';
import { SmashBall } from './rotulacion';

const piezas = (cantidad) => Array.from({ length: cantidad }, (_, i) => ({
    x: ((i * .61803398875) % 1) * 100,
    tam: i < 3 ? 140 + i * 40 : 8 + (i % 5) * 7,
    duracion: 38 + (i % 7) * 6,
    retraso: -((i * .41421356237) % 1) * 60,
    tipo: i < 3 ? 'smash' : i % 3 === 0 ? 'lleno' : 'anillo',
    color: i % 4,
}));
const ESCRITORIO = piezas(40), MOVIL = piezas(18);

export default function FondoVivo() {
    const [pausado, setPausado] = useState(false);
    const [reducido, setReducido] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [movil, setMovil] = useState(() => window.matchMedia('(max-width: 639px)').matches);
    useEffect(() => {
        const preferencias = [['(prefers-reduced-motion: reduce)', setReducido], ['(max-width: 639px)', setMovil]].map(([consulta, guardar]) => {
            const mq = window.matchMedia(consulta);
            const actualizar = () => guardar(mq.matches);
            mq.addEventListener('change', actualizar);
            return () => mq.removeEventListener('change', actualizar);
        });
        return () => preferencias.forEach(quitar => quitar());
    }, []);
    return <>
        <div className={`fondo-vivo ${pausado ? 'quieto' : ''}`} aria-hidden="true">
            {(movil ? MOVIL : ESCRITORIO).map((p, i) => (
                <span key={i} className={`particula particula-${p.tipo} tono-${p.color}`} style={{ left: `${p.x}%`, width: p.tam, height: p.tam, animationDuration: `${p.duracion}s`, animationDelay: `${p.retraso}s` }}>
                    {p.tipo === 'smash' && <SmashBall tam={p.tam} />}
                </span>
            ))}
        </div>
        {!reducido && <button type="button" onClick={() => setPausado(p => !p)} aria-pressed={pausado} className="control-fondo flex min-h-11 items-center gap-2 rounded-lg border border-linea bg-panel px-3 text-xs text-tinta hover:border-menta hover:text-menta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{pausado ? <path d="m8 5 11 7-11 7V5Z" /> : <path d="M8 5v14M16 5v14" />}</svg>
            {pausado ? 'Animar fondo' : 'Pausar fondo'}
        </button>}
    </>;
}
