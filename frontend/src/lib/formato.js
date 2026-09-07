export const fmtFecha = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

export const fmtFechaCorta = (ms) =>
    ms ? new Date(ms).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
