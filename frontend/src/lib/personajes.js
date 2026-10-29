import MANIFIESTO from './personajes.json';

export const RANDOM = '/fighter-portraits/random.svg';
export const PERSONAJES = Object.keys(MANIFIESTO);
export const skinsDe = (slug) => MANIFIESTO[slug]?.skins ?? [];

const NOMBRES = {
    'banjo-kazooie': 'Banjo & Kazooie',
    'bowser-jr': 'Bowser Jr.',
    'dr-mario': 'Dr. Mario',
    'king-k-rool': 'King K. Rool',
    'mr-game-and-watch': 'Mr. Game & Watch',
    'pokemon-trainer': 'Pokémon Trainer',
    'pokemon-trainer-charizard': 'Charizard',
    'pokemon-trainer-ivysaur': 'Ivysaur',
    'pokemon-trainer-squirtle': 'Squirtle',
    'pyra-and-mythra': 'Pyra & Mythra',
    rob: 'R.O.B.',
    'rosalina-and-luma': 'Rosalina & Luma',
    'wii-fit-trainer': 'Wii Fit Trainer',
    'zero-suit-samus': 'Zero Suit Samus',
};

export const nombreDe = (slug) =>
    NOMBRES[slug] || (slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const partirSkin = (skin) => {
    const [slug = '', n = ''] = String(skin ?? '').split(':');
    return MANIFIESTO[slug] ? { slug, n: Number(n) } : { slug: '', n: null };
};

export const armarSkin = (slug, n) => (slug ? `${slug}:${n ?? skinsDe(slug)[0]}` : '');

export const retratoDe = (skin) => {
    const { slug, n } = partirSkin(skin);
    if (!slug) return RANDOM;
    const skins = skinsDe(slug);
    return `/fighter-portraits/${slug}/small_${skins.includes(n) ? n : skins[0]}.${MANIFIESTO[slug].ext}`;
};

export const etiquetaDe = (skin) => {
    const { slug } = partirSkin(skin);
    return slug ? nombreDe(slug) : 'Sin main';
};

export const arteDe = (skin) => partirSkin(skin).slug ? retratoDe(skin) : null;

const EMBLEMAS = import.meta.glob('../assets/series-icons/*.svg', { eager: true, query: '?url', import: 'default' });
const SERIES = {
    mario: 'mario luigi peach daisy bowser bowser-jr dr-mario rosalina-and-luma piranha-plant',
    'donkey-kong': 'donkey-kong diddy-kong king-k-rool',
    'the-legend-of-zelda': 'link zelda sheik ganondorf young-link toon-link',
    metroid: 'samus dark-samus zero-suit-samus ridley',
    kirby: 'kirby meta-knight king-dedede',
    'star-fox': 'fox falco wolf',
    pokemon: 'pikachu jigglypuff pichu mewtwo lucario greninja incineroar pokemon-trainer pokemon-trainer-charizard pokemon-trainer-ivysaur pokemon-trainer-squirtle',
    earthbound: 'ness lucas',
    'f-zero': 'captain-falcon',
    'fire-emblem': 'marth roy chrom lucina ike robin corrin byleth',
    'game-and-watch': 'mr-game-and-watch',
    'kid-icarus': 'pit dark-pit palutena',
    'metal-gear': 'snake',
    pikmin: 'olimar',
    'animal-crossing': 'villager isabelle',
    'wii-fit': 'wii-fit-trainer',
    'punch-out': 'little-mac',
    'xenoblade-chronicles': 'shulk pyra-and-mythra',
    'street-fighter': 'ryu ken',
    'final-fantasy-vii': 'cloud sephiroth',
    splatoon: 'inkling',
    castlevania: 'simon richter',
    persona: 'joker',
    'dragon-quest': 'hero',
    'fatal-fury': 'terry',
    arms: 'min-min',
    minecraft: 'steve',
    tekken: 'kazuya',
    'kingdom-hearts': 'sora',
    'super-smash-bros': 'mii-brawler mii-swordfighter mii-gunner',
};
const SERIE_DE = Object.fromEntries(Object.entries(SERIES).flatMap(([s, lista]) => lista.split(' ').map((p) => [p, s])));
export const emblemaDe = (skin) => {
    const { slug } = partirSkin(skin);
    return slug ? EMBLEMAS[`../assets/series-icons/${SERIE_DE[slug] || slug}.svg`] ?? null : null;
};

const plano = (texto) => texto.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
export const slugDePersonaje = (nombre) => {
    const buscado = plano(String(nombre ?? ''));
    if (!buscado) return null;
    return PERSONAJES.find((s) => plano(s) === buscado || plano(nombreDe(s)) === buscado)
        ?? PERSONAJES.find((s) => plano(s).includes(buscado)) ?? null;
};
