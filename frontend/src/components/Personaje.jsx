import { PERSONAJES, armarSkin, etiquetaDe, nombreDe, partirSkin, retratoDe, skinsDe } from '../lib/personajes';

export const Retrato = ({ skin, tam = 44, className = '' }) => (
    <img
        src={retratoDe(skin)}
        alt={etiquetaDe(skin)}
        title={etiquetaDe(skin)}
        width={tam}
        height={tam}
        loading="lazy"
        style={{ width: tam, height: tam }}
        className={`shrink-0 rounded-lg border border-slate-700 bg-gradient-to-b from-slate-700/50
            to-slate-900 object-contain ${className}`}
    />
);

export function SelectorMain({ skin, onChange }) {
    const { slug, n } = partirSkin(skin);
    const skins = slug ? skinsDe(slug) : [];

    return (
        <div className="flex items-center gap-2">
            <Retrato skin={skin} tam={36} />
            <div className="space-y-1">
                <select
                    value={slug}
                    onChange={(e) => onChange(armarSkin(e.target.value))}
                    className="w-40 rounded border border-slate-700 bg-slate-900 px-1.5 py-1 text-slate-100"
                >
                    <option value="">— random —</option>
                    {PERSONAJES.map((p) => (
                        <option key={p} value={p}>
                            {nombreDe(p)}
                        </option>
                    ))}
                </select>
                {skins.length > 1 && (
                    <div className="flex flex-wrap gap-0.5">
                        {skins.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => onChange(armarSkin(slug, s))}
                                title={`alt ${skins.indexOf(s) + 1}`}
                                className={`rounded border ${
                                    s === n ? 'border-indigo-400' : 'border-transparent hover:border-slate-600'
                                }`}
                            >
                                <Retrato skin={armarSkin(slug, s)} tam={22} className="rounded" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
