import { useId } from 'react';
import { CUARTOS_SMASH } from '../lib/smash';



const svg = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.25,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    focusable: false,
};

export const IconoCorazon = ({ lleno = false, tam = 16 }) => (
    <svg {...svg} width={tam} height={tam} fill={lleno ? 'currentColor' : 'none'}>
        <path d="M12 20.5 4.2 12.9a4.9 4.9 0 0 1 0-7 5 5 0 0 1 7.1 0l.7.7.7-.7a5 5 0 0 1 7.1 0 4.9 4.9 0 0 1 0 7Z" />
    </svg>
);

export const IconoFlecha = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}>
        <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
);

export const IconoFlechaDir = ({ tam = 16, dir = 0 }) => (
    <svg {...svg} width={tam} height={tam} style={{ rotate: `${dir}deg` }}>
        <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
);

export const IconoChevron = ({ tam = 16, arriba = false }) => (
    <svg {...svg} width={tam} height={tam} style={{ rotate: arriba ? '180deg' : '0deg', transition: 'rotate 200ms' }}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export const IconoExterno = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}>
        <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
);

export const IconoMas = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}><path d="M12 5v14M5 12h14" /></svg>
);

export const IconoMenos = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}><path d="M5 12h14" /></svg>
);

export const IconoMenu = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);

export const IconoInscripcion = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}><path d="M9 4h6v3H9zM7 5.5H5v15h14v-15h-2M8.5 13l2.5 2.5 4.5-5" /></svg>
);

export const IconoControl = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}><path d="M7 8h10a5 5 0 0 1 4.8 6.4l-.8 2.8a2.4 2.4 0 0 1-4 1L15 16H9l-2 2.2a2.4 2.4 0 0 1-4-1l-.8-2.8A5 5 0 0 1 7 8ZM7.5 11v3M6 12.5h3" /><circle cx="15.5" cy="11.5" r=".6" fill="currentColor" /><circle cx="17.5" cy="13.5" r=".6" fill="currentColor" /></svg>
);

export const IconoGente = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></svg>
);

export const IconoCerrar = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}>
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

export const IconoPin = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}>
        <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
    </svg>
);

export const IconoCalendario = ({ tam = 16 }) => (
    <svg {...svg} width={tam} height={tam}>
        <rect x="3.5" y="5.5" width="17" height="15" rx="1" />
        <path d="M3.5 10.5h17M8 3.5v4M16 3.5v4" />
    </svg>
);

export const Placa = ({ tono = 'flanco', className = '', children, ...props }) => (
    <div className={`superficie ${tono === 'bermellon' ? 'border-rose-400/50 bg-rose-950' : ''} ${className}`} {...props}>{children}</div>
);
const TAMANOS = { seccion: 'text-2xl sm:text-3xl', placa: 'text-xl', chico: 'text-base' };
export const Rotulo = ({ tam = 'seccion', como: Como = 'h2', className = '', children, ...props }) => (
    <Como className={`titulo-competitivo ${TAMANOS[tam] || TAMANOS.seccion} ${className}`} {...props}>{children}</Como>
);

export const SmashBall = ({ tam = 24, className = '', ...props }) => {
    const id = useId();
    return (
        <svg viewBox="-1 -1 2 2" width={tam} height={tam} className={className} fill="currentColor" aria-hidden="true" focusable="false" {...props}>
            <clipPath id={id}><circle r="1" /></clipPath>
            <g clipPath={`url(#${id})`}>{CUARTOS_SMASH.map(([x, y, w, h]) => <rect key={`${x}${y}`} x={x} y={y} width={w} height={h} />)}</g>
        </svg>
    );
};
