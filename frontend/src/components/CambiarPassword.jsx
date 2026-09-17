import { useState } from 'react';
import { api, guardarToken } from '../lib/api';
import { Aviso, Boton, Campo, Card } from './ui';

const LARGO_MINIMO = 10;

export default function CambiarPassword({ obligatorio = false, onListo, onCancelar }) {
    const [passwordActual, setPasswordActual] = useState('');
    const [nueva, setNueva] = useState('');
    const [repetida, setRepetida] = useState('');
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setError(null);

        if (nueva !== repetida) return setError('Las contraseñas no coinciden');
        if (nueva.length < LARGO_MINIMO) return setError(`La contraseña debe tener al menos ${LARGO_MINIMO} caracteres`);

        setCargando(true);
        try {
            const data = await api.cambiarPassword(passwordActual, nueva);
            guardarToken(data.token);
            onListo(data.admin);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="mx-auto max-w-sm py-16">
            <Card titulo={obligatorio ? 'Define tu contraseña' : 'Cambiar contraseña'}>
                <form onSubmit={enviar} className="flex flex-col gap-3">
                    {obligatorio && (
                        <Aviso
                            tipo="info"
                            mensaje={
                                'Entraste con la contraseña temporal que te llegó por correo. ' +
                                'Define una propia para poder usar el panel.'
                            }
                        />
                    )}
                    <Campo
                        label={obligatorio ? 'Contraseña temporal' : 'Contraseña actual'}
                        type="password"
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                    <Campo
                        label="Contraseña nueva"
                        type="password"
                        value={nueva}
                        onChange={(e) => setNueva(e.target.value)}
                        autoComplete="new-password"
                        minLength={LARGO_MINIMO}
                        required
                    />
                    <Campo
                        label="Repetila"
                        type="password"
                        value={repetida}
                        onChange={(e) => setRepetida(e.target.value)}
                        autoComplete="new-password"
                        minLength={LARGO_MINIMO}
                        required
                    />
                    <Aviso tipo="error" mensaje={error} onCerrar={() => setError(null)} />
                    <Boton type="submit" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Guardar contraseña'}
                    </Boton>
                    {onCancelar && (
                        <Boton type="button" variante="fantasma" onClick={onCancelar}>
                            {obligatorio ? 'Salir' : 'Cancelar'}
                        </Boton>
                    )}
                    <p className="text-xs text-slate-500">
                        Mínimo {LARGO_MINIMO} caracteres, con al menos una letra y un número.
                        Al guardarla se cierran las demás sesiones abiertas con la anterior.
                    </p>
                </form>
            </Card>
        </div>
    );
}
