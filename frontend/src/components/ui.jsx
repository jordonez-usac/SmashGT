const VARIANTES = {
    primario: 'bg-menta hover:bg-verde text-noche',
    secundario: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    peligro: 'bg-red-700 hover:bg-red-600 text-white',
    fantasma: 'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700',
};

export const Boton = ({ variante = 'primario', className = '', ...props }) => (
    <button
        className={`min-h-11 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
            disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTES[variante]} ${className}`}
        {...props}
    />
);

export const Campo = ({ label, className = '', ...props }) => (
    <label className="flex min-w-0 max-w-full flex-col gap-1 text-sm">
        {label && <span className="font-medium text-slate-400">{label}</span>}
        <input
            className={`min-h-11 max-w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-100
                outline-none placeholder:text-slate-600 focus:border-menta ${className}`}
            {...props}
        />
    </label>
);

export const Area = ({ label, className = '', ...props }) => (
    <label className="flex min-w-0 max-w-full flex-col gap-1 text-sm">
        {label && <span className="font-medium text-slate-400">{label}</span>}
        <textarea
            className={`min-h-11 max-w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-100
                outline-none placeholder:text-slate-600 focus:border-menta ${className}`}
            {...props}
        />
    </label>
);

export const Card = ({ titulo, acciones, children, className = '' }) => (
    <section className={`rounded-xl border border-linea bg-panel ${className}`}>
        {(titulo || acciones) && (
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
                <h2 className="font-semibold text-slate-100">{titulo}</h2>
                {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
            </header>
        )}
        <div className="p-4">{children}</div>
    </section>
);

const TONOS_BADGE = {
    ok: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    alerta: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    error: 'bg-red-500/15 text-red-300 border-red-500/30',
    neutro: 'bg-slate-500/15 text-slate-300 border-slate-600/40',
};

export const Badge = ({ tono = 'neutro', children }) => (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONOS_BADGE[tono]}`}>
        {children}
    </span>
);

export const Aviso = ({ tipo = 'info', mensaje, onCerrar }) => {
    if (!mensaje) return null;
    const tonos = {
        info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
        exito: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        error: 'border-red-500/30 bg-red-500/10 text-red-200',
    };
    return (
        <div className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm ${tonos[tipo]}`}>
            <span className="whitespace-pre-wrap">{mensaje}</span>
            {onCerrar && (
                <button onClick={onCerrar} className="grid min-h-11 w-11 shrink-0 place-items-center opacity-80 hover:opacity-100" aria-label="Cerrar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
            )}
        </div>
    );
};
