import { IconoCerrar } from '../publico/rotulacion';

const IconoCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>;

const Captura = ({ src, alt, marcas = [], tono = 'menta' }) => (
    <figure className="relative self-start overflow-hidden rounded-lg border border-slate-700 bg-white">
        <img src={src} alt={alt} loading="lazy" className="block w-full" />
        {marcas.map(([izq, arriba, ancho, alto], i) => (
            <span
                key={i}
                aria-hidden="true"
                className={`absolute rounded-md border-[3px] ${tono === 'error' ? 'border-rose-500' : 'border-emerald-400'} shadow-[0_0_0_4px_rgb(0_0_0/0.15)]`}
                style={{ left: `${izq}%`, top: `${arriba}%`, width: `${ancho}%`, height: `${alto}%` }}
            />
        ))}
    </figure>
);

const Paso = ({ n, titulo, children }) => (
    <li className="grid content-start gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
        <p className="flex items-center gap-3 font-semibold text-slate-100">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-menta text-sm font-bold text-noche">{n}</span>
            {titulo}
        </p>
        {children}
    </li>
);

export default function GuiaBraacket({ abierta }) {
    return (
        <details open={abierta} className="group rounded-lg border border-slate-800">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm font-semibold text-slate-200">
                ¿Cómo descargo los CSV de Braacket?
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true" className="transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <ol className="grid gap-3 p-4 pt-0 lg:grid-cols-2">
                <Paso n={1} titulo="Ranking: muestra a todos y presiona Export">
                    <p className="text-sm text-slate-400">Abre el ranking de la liga en Braacket. Baja al final de la tabla y cambia <strong className="text-slate-200">Rows</strong> para que se vean todos los jugadores (por ejemplo, 50).</p>
                    <Captura src="/guia-braacket/ranking-rows.png" alt="Selector Rows en 50 al final del ranking de Braacket" marcas={[[5, 40, 91, 20]]} />
                    <p className="text-sm text-slate-400">Luego vuelve arriba y presiona el ícono de <strong className="text-slate-200">Export</strong>. Se descarga el CSV del ranking.</p>
                    <Captura src="/guia-braacket/ranking-export.png" alt="Botón Export en la página del ranking de Braacket" marcas={[[37.9, 46.7, 26.2, 10.7]]} />
                </Paso>
                <Paso n={2} titulo="Head-to-head: deja Data en «Match result»">
                    <p className="text-sm text-slate-400">Entra a la pestaña <strong className="text-slate-200">Head-to-head</strong> de la liga. Revisa que <strong className="text-slate-200">Data</strong> diga <em>Match result</em>.</p>
                    <Captura src="/guia-braacket/h2h-export.png" alt="Selector Data en Match result en el head-to-head de Braacket" marcas={[[10.9, 16.5, 47.5, 12.1]]} />
                </Paso>
                <Paso n={3} titulo="Pon Rows y Cols igual que los jugadores del ranking">
                    <p className="text-sm text-slate-400">Abajo de la tabla, cambia <strong className="text-slate-200">Rows</strong> y <strong className="text-slate-200">Cols</strong> a la misma cantidad de jugadores del ranking (por ejemplo, 50). Si lo dejas en 15, el panel lo va a rechazar.</p>
                    <div className="grid gap-3">
                        <div className="grid gap-1.5">
                            <p className="flex items-center gap-1.5 text-xs font-bold text-rose-400"><IconoCerrar tam={14} />Incorrecto: 15</p>
                            <Captura src="/guia-braacket/h2h-15-incorrecto.png" alt="Rows y Cols en 15, incorrecto" marcas={[[10.5, 50.5, 74, 33]]} tono="error" />
                        </div>
                        <div className="grid gap-1.5">
                            <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-400"><IconoCheck />Correcto: 50</p>
                            <Captura src="/guia-braacket/h2h-50-correcto.png" alt="Rows y Cols en 50, correcto" marcas={[[15, 62, 68, 26]]} />
                        </div>
                    </div>
                </Paso>
                <Paso n={4} titulo="Exporta el head-to-head y sube los dos archivos">
                    <p className="text-sm text-slate-400">Vuelve arriba y presiona <strong className="text-slate-200">Export</strong> en el head-to-head. Luego elige aquí abajo el CSV del ranking y el del head-to-head.</p>
                    <Captura src="/guia-braacket/h2h-export.png" alt="Botón Export en el head-to-head de Braacket" marcas={[[40.7, 52.6, 22.7, 11.8]]} />
                </Paso>
            </ol>
        </details>
    );
}
