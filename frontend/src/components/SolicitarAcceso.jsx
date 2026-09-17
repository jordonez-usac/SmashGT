import { useState } from 'react';
import { api } from '../lib/api';
import { Area, Boton, Campo, Aviso } from './ui';

export default function SolicitarAcceso({ onVolver }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState(null);
    const [enviada, setEnviada] = useState(null);
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);
        try {
            const data = await api.solicitarRegistro(nombre, email, motivo);
            setEnviada(data.msg);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    if (enviada) {
        return (
            <div className="flex flex-col gap-3">
                <Aviso tipo="exito" mensaje={enviada} />
                <Boton variante="fantasma" onClick={onVolver}>
                    Volver a iniciar sesión
                </Boton>
            </div>
        );
    }

    return (
        <form onSubmit={enviar} className="flex flex-col gap-3">
            <Campo
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Cómo te llamas"
                minLength={3}
                maxLength={80}
                required
            />
            <Campo
                label="Correo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                required
            />
            <Area
                label="Motivo (opcional)"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Contale al admin quién sos y para qué necesitas el panel"
                rows={3}
                maxLength={500}
            />
            <Aviso tipo="error" mensaje={error} onCerrar={() => setError(null)} />
            <Boton type="submit" disabled={cargando}>
                {cargando ? 'Enviando...' : 'Enviar solicitud'}
            </Boton>
            <Boton type="button" variante="fantasma" onClick={onVolver}>
                Ya tengo cuenta
            </Boton>
            <p className="text-xs text-slate-500">
                El administrador principal revisa la solicitud. Si la aprueba, te llega
                una contraseña temporal a este correo y al entrar defines la tuya.
            </p>
        </form>
    );
}
