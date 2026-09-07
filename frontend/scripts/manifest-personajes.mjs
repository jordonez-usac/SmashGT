import { readdirSync, writeFileSync } from 'node:fs';

const BASE = 'public/fighter-portraits';
const manifiesto = {};

for (const slug of readdirSync(BASE, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const porExt = {};
    for (const archivo of readdirSync(`${BASE}/${slug.name}`)) {
        const m = archivo.match(/^small_(\d+)\.(webp|png)$/);
        if (m) (porExt[m[2]] ??= []).push(Number(m[1]));
    }
    const ext = porExt.webp ? 'webp' : 'png';
    if (porExt[ext]) manifiesto[slug.name] = { ext, skins: porExt[ext].sort((a, b) => a - b) };
}

const ordenado = Object.fromEntries(Object.entries(manifiesto).sort());
writeFileSync('src/lib/personajes.json', JSON.stringify(ordenado, null, 0) + '\n');
console.log(`${Object.keys(ordenado).length} personajes en src/lib/personajes.json`);
