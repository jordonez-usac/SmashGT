import { useMovimiento } from '../lib/movimiento';

export default function DetalleAnimado({ children, className }) {
    const ref = useMovimiento('abierto');
    return <div ref={ref} className={className}>{children}</div>;
}
