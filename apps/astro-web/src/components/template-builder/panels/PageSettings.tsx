import type { PageConfig } from "@/lib/template-config";

interface Props {
    config: PageConfig;
    onChange: (v: Partial<PageConfig>) => void;
}

const PAGE_SIZES = ["A4", "Letter", "A5", "B5"] as const;

export function PageSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Page Settings</h3>

            {/* Page Size */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Page Size</label>
                <select
                    value={config.size}
                    onChange={(e) => onChange({ size: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:ring-1 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                >
                    {PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Orientation */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Orientation</label>
                <div className="flex gap-2">
                    {(["portrait", "landscape"] as const).map((o) => (
                        <button
                            key={o}
                            onClick={() => onChange({ orientation: o })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${config.orientation === o
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                    : "bg-stone-50 text-stone-500 hover:bg-stone-100"
                                }`}
                        >
                            {o.charAt(0).toUpperCase() + o.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Margins */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-2">Margins (mm)</label>
                <div className="grid grid-cols-2 gap-3">
                    {(["top", "right", "bottom", "left"] as const).map((side) => (
                        <div key={side}>
                            <label className="block text-[10px] text-stone-400 uppercase mb-1">{side}</label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={config.margins[side]}
                                onChange={(e) =>
                                    onChange({ margins: { ...config.margins, [side]: Number(e.target.value) } })
                                }
                                className="w-full accent-emerald-600"
                            />
                            <div className="text-[10px] text-stone-500 text-center">{config.margins[side]}mm</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Color */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Background Color</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded border border-stone-200 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-mono"
                    />
                </div>
            </div>

            {/* Print Background */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.printBackground}
                    onChange={(e) => onChange({ printBackground: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-sm text-stone-600">Print background</span>
            </label>
        </div>
    );
}
