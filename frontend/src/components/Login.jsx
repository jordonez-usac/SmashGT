import { useState } from 'react';
import { api, guardarToken } from '../lib/api';
import { Boton, Campo, Card, Aviso } from './ui';
import SolicitarAcceso from './SolicitarAcceso';

export default function Login({ onLogin }) {
    const [vista, setVista] = useState('entrar');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);
        try {
            const data = await api.login(email, password);
            guardarToken(data.token);
            onLogin(data.admin, data.requiereCambioPassword);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="mx-auto max-w-sm py-16">
            <Card titulo={vista === 'entrar' ? 'Entrar como admin' : 'Pedir acceso al panel'}>
                {vista === 'solicitar' ? (
                    <SolicitarAcceso onVolver={() => setVista('entrar')} />
                ) : (
                    <form onSubmit={enviar} className="flex flex-col gap-3">
                        <Campo
                            label="Correo"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ejemplo.com"
                            autoComplete="username"
                            required
                        />
                        <Campo
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <Aviso tipo="error" mensaje={error} onCerrar={() => setError(null)} />
                        <Boton type="submit" disabled={cargando}>
                            {cargando ? 'Entrando...' : 'Entrar'}
                        </Boton>
                        <Boton type="button" variante="fantasma" onClick={() => setVista('solicitar')}>
                            No tengo cuenta, pedir acceso
                        </Boton>
                        <p className="text-xs text-slate-500">
                            Las cuentas las aprueba el administrador principal. Si te aprueba,
                            te llega una contraseña temporal por correo.
                        </p>
                    </form>
                )}
            </Card>
        </div>
    );
}
