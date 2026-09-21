import { useState } from 'react';
import { Boton, Card } from './ui';

export default function VisorJson({ titulo, data, defaultAbierto = false }) {
    const [abierto, setAbierto] = useState(defaultAbierto);
    const texto = JSON.stringify(data, null, 2);

    return (
        <Card
            titulo={titulo}
            acciones={
                <>
                    <Boton variante="fantasma" onClick={() => navigator.clipboard?.writeText(texto)}>
                        Copiar
                    </Boton>
                    <Boton variante="fantasma" onClick={() => setAbierto(!abierto)}>
                        {abierto ? 'Ocultar' : 'Mostrar'}
                    </Boton>
                </>
            }
        >
            {abierto ? (
                <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-300">
                    {texto}
                </pre>
            ) : (
                <p className="text-sm text-slate-500">
                    {Array.isArray(data?.jugadores) ? `${data.jugadores.length} jugadores` : 'Oculto'}
                </p>
            )}
        </Card>
    );
}
