import { Link } from 'react-router-dom';
import { Titulo } from './piezas';
import { IconoControl, IconoExterno, IconoFlecha, IconoGente, IconoInscripcion, IconoPin, SmashBall } from './rotulacion';

const DIA = [
    [IconoInscripcion, 'Inscripción', 'Te registras en la página del torneo en start.gg antes de la fecha límite. Ahí están el costo, el horario y las reglas.'],
    [IconoPin, 'Check-in', 'Al llegar confirmas tu asistencia con los organizadores o en start.gg. Si no haces check-in a tiempo puedes quedar fuera del bracket.'],
    [IconoGente, 'El bracket', 'Te toca jugar contra alguien según tu seed. Cuando terminas un set, reportan el resultado y esperas tu siguiente llamado.'],
    [IconoControl, 'Tu set', 'Buscas un setup libre, eligen escenarios y personajes, y juegan. Al terminar, saludas a tu rival: así empiezan las amistades de la escena.'],
];

const REGLAS = [
    ['Formato', '3 stocks, 7 minutos por partida. Sin objetos, sin Final Smash y sin peligros de escenario.'],
    ['Sets', 'Al mejor de 3 (BO3) la mayor parte del torneo; en top 8 suele subir a mejor de 5 (BO5).'],
    ['Escenarios', 'La primera partida se elige baneando escenarios entre los dos jugadores. Después, quien ganó banea y quien perdió elige.'],
    ['Personajes', 'En la primera partida eligen a ciegas; desde la segunda, quien ganó elige primero y quien perdió puede cambiar después.'],
];

const GLOSARIO = [
    ['Set', 'Una serie de partidas contra el mismo rival, por ejemplo al mejor de 3.'],
    ['Stock', 'Cada una de las vidas de tu personaje.'],
    ['Bracket', 'El cuadro del torneo. En doble eliminación hay lado de ganadores (winners) y de perdedores (losers).'],
    ['Seed', 'Tu posición inicial en el bracket según tu nivel o resultados anteriores.'],
    ['Grand Finals', 'La final entre quien viene de winners y quien viene de losers.'],
    ['Reset', 'Cuando quien viene de losers gana la primera serie de la final y se juega otra.'],
    ['Main', 'El personaje con el que más compites. Tu secundario es el que usas como alternativa.'],
    ['Neutral', 'Los momentos en que nadie tiene ventaja y ambos buscan conectar el primer golpe.'],
    ['Edgeguard', 'Impedir que tu rival regrese al escenario cuando está fuera.'],
    ['DQ', 'Descalificación, normalmente por no presentarse a tiempo a tu set.'],
];

const RECURSOS = [
    ['Ultimate Frame Data', 'Datos de cada ataque de todos los personajes.', 'https://ultimateframedata.com/'],
    ['SmashWiki', 'Enciclopedia de la saga, con técnicas y términos.', 'https://www.ssbwiki.com/'],
    ['start.gg', 'Donde se publican e inscriben los torneos.', 'https://start.gg/'],
];

export default function Guia() {
    return (
        <div className="space-y-16">
            <section>
                <Titulo>Guía de torneos</Titulo>
                <p className="-mt-2 max-w-2xl text-sm leading-6 text-tinta">Todo lo que necesitas saber para tu primer torneo de Smash Bros. Ultimate en Guatemala. Las reglas cambian un poco entre torneos: revisa siempre las de cada evento en start.gg.</p>
            </section>

            <section>
                <h2 data-scroll="titulo" className="titulo-competitivo mb-5 text-2xl sm:text-3xl">El día del torneo</h2>
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {DIA.map(([Icono, titulo, texto], i) => (
                        <li key={titulo} data-scroll="tarjeta" data-demora={i * .06} className="guia-paso superficie">
                            <div className="flex items-center justify-between"><span className="titulo-competitivo cifra text-3xl text-menta">{String(i + 1).padStart(2, '0')}</span><span className="primera-icono"><Icono tam={22} /></span></div>
                            <h3 className="mt-3 font-bold text-white">{titulo}</h3>
                            <p className="mt-1 text-sm leading-6 text-tinta">{texto}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="guia-reglas zona-oscura">
                <SmashBall className="guia-smash" />
                <h2 data-scroll="titulo" className="titulo-competitivo relative text-2xl sm:text-3xl">Las reglas más comunes</h2>
                <dl className="relative mt-6 grid gap-4 sm:grid-cols-2">
                    {REGLAS.map(([nombre, texto]) => <div key={nombre} className="guia-regla"><dt className="text-xs font-bold uppercase tracking-widest text-menta">{nombre}</dt><dd className="mt-2 text-sm leading-6 text-tinta">{texto}</dd></div>)}
                </dl>
            </section>

            <section>
                <h2 data-scroll="titulo" className="titulo-competitivo mb-5 text-2xl sm:text-3xl">Glosario de la escena</h2>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                    {GLOSARIO.map(([termino, texto]) => <div key={termino} className="guia-termino"><dt className="font-bold text-white">{termino}</dt><dd className="text-sm leading-6 text-tinta">{texto}</dd></div>)}
                </dl>
            </section>

            <section>
                <h2 data-scroll="titulo" className="titulo-competitivo mb-5 text-2xl sm:text-3xl">Para mejorar</h2>
                <ul className="grid gap-3 sm:grid-cols-3">
                    {RECURSOS.map(([nombre, texto, url]) => <li key={nombre}><a href={url} target="_blank" rel="noreferrer" className="guia-recurso superficie"><span className="flex items-center justify-between font-bold text-white">{nombre}<IconoExterno tam={15} /></span><span className="mt-1 block text-sm leading-6 text-tinta">{texto}</span></a></li>)}
                </ul>
            </section>

            <section data-scroll="panel" className="primera-vez bloque-acento justify-between">
                <div><h2 className="titulo-competitivo text-3xl">¿Listo para jugar?</h2><p className="mt-3 text-sm leading-6">Busca el torneo más cercano y nos vemos en el bracket.</p></div>
                <Link to="/torneos" className="accion-principal shrink-0">Ver torneos <IconoFlecha tam={18} /></Link>
            </section>
        </div>
    );
}
