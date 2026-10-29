import { Link } from 'react-router-dom';
import { arteDe, emblemaDe, etiquetaDe } from '../lib/personajes';
import { tieneDatos } from '../lib/h2h';
import { IconoFlecha } from './rotulacion';
import { interaccionPersonaje } from '../lib/interaccion';

export function ContenidoBanda({ j }) {
    const { wins = 0, losses = 0 } = j.matches || {};
    const pct = wins + losses ? Math.round(wins / (wins + losses) * 100) : 0;
    const puesto = String(j.puesto).padStart(2,'0');
    const arte = arteDe(j.skin);
    const emblema = emblemaDe(j.skin);
    return <>
        {emblema && <span className="banda-emblema" style={{ '--emblema': `url("${emblema}")` }} aria-hidden="true" />}
        <span className="banda-luz" aria-hidden="true" />
        <span className="banda-arte">
            <span className="banda-fondo-num cifra" aria-hidden="true">{puesto}</span>
            {arte && <img src={arte} alt={etiquetaDe(j.skin)} loading="lazy" className="banda-personaje arte-interactivo" />}
        </span>
        <span className="banda-insignia cifra" aria-label={`Puesto ${j.puesto}`}>{puesto}</span>
        <div className="banda-identidad">
            {j.team && <p className="banda-team">{j.team}</p>}
            <h3 className={`banda-nombre ${j.nombre.split(' ').some(p => p.length > 10) ? 'largo' : ''}`}>{j.nombre}</h3>
            <div className="banda-chips">
                {arte && <span className="banda-main">{etiquetaDe(j.skin)}</span>}
                {tieneDatos(j.matches) && <span className="banda-record cifra"><span className="text-gana">{wins}V</span> · <span className="text-pierde">{losses}D</span><b>{pct}%</b></span>}
            </div>
            {tieneDatos(j.matches) && <span className="banda-barra" style={{ '--pct': `${pct}%` }} aria-hidden="true" />}
        </div>
    </>;
}

export default function BandaRanking({ jugadores }) {
    if (!jugadores?.length) return <p className="text-sm text-tinta">Este ranking no tiene jugadores todavía.</p>;
    return <ol className="bandas-jugadores grid gap-x-6 gap-y-4 lg:grid-cols-2">{jugadores.map((j, i) => {
        const Envoltura = j.player_id ? Link : 'div';
        return <li data-scroll="jugador" data-demora={i % 2 * .12} key={`${j.puesto}-${j.nombre}`}>
            <Envoltura {...interaccionPersonaje} {...(j.player_id ? { to: `/jugador/${encodeURIComponent(j.player_id)}`, title: `Ver el perfil de ${j.nombre}` } : {})} className="banda-jugador" data-podio={j.puesto <= 3 ? j.puesto : undefined} style={{ '--i': i }}>
                <ContenidoBanda j={j} />
                {j.player_id && <span className="banda-flecha" aria-hidden="true"><IconoFlecha tam={18} /></span>}
            </Envoltura>
        </li>;
    })}</ol>;
}
