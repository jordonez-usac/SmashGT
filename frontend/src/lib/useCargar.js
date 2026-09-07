import { useCallback, useEffect, useState } from 'react';

export function useCargar(peticion) {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const recargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            setDatos(await peticion());
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, [peticion]);

    useEffect(() => {
        let vigente = true;
        (async () => {
            setCargando(true);
            setDatos(null);
            setError(null);
            try {
                const data = await peticion();
                if (vigente) setDatos(data);
            } catch (err) {
                if (vigente) setError(err.message);
            } finally {
                if (vigente) setCargando(false);
            }
        })();
        return () => {
            vigente = false;
        };
    }, [peticion]);

    return { datos, cargando, error, recargar };
}
