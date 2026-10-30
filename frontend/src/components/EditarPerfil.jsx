import { useState } from 'react';
import { api } from '../lib/api';
import { Aviso, Boton, Campo, Card } from './ui';

export default function EditarPerfil({ admin, onListo, onCancelar }) {
    const [nombre, setNombre] = useState(admin.nombre);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);
        try {
            const data = await api.actualizarPerfil(nombre);
            onListo(data.admin);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="mx-auto max-w-sm py-16">
            <Card titulo="Mis datos">
                <form onSubmit={enviar} className="flex flex-col gap-3">
                    <Campo
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoComplete="name"
                        minLength={3}
                        maxLength={80}
                        required
                    />
                    <Campo label="Correo" value={admin.email} disabled className="cursor-not-allowed opacity-60" />
                    <Aviso tipo="error" mensaje={error} onCerrar={() => setError(null)} />
                    <Boton type="submit" disabled={cargando || nombre.trim() === admin.nombre}>
                        {cargando ? 'Guardando...' : 'Guardar'}
                    </Boton>
                    <Boton type="button" variante="fantasma" onClick={onCancelar}>
                        Cancelar
                    </Boton>
                    <p className="text-xs text-slate-500">Es el nombre que aparece en tus noticias.</p>
                </form>
            </Card>
        </div>
    );
}
