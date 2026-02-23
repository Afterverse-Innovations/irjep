import type { LayoutConfig } from "@/lib/template-config";

interface Props {
    config: LayoutConfig;
    onChange: (v: Partial<LayoutConfig>) => void;
}

export function LayoutSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Layout</h3>

            {/* Column Count */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Columns</label>
                <div className="flex gap-2">
                    {([1, 2, 3] as const).map((n) => (
                        <button
                            key={n}
                            onClick={() => onChange({ columnCount: n })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${config.columnCount === n
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                    : "bg-stone-50 text-stone-500 hover:bg-stone-100"
                                }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Column Gap */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    Column Gap: {config.columnGap}mm
                </label>
                <input
                    type="range" min="2" max="20" step="0.5"
                    value={config.columnGap}
                    onChange={(e) => onChange({ columnGap: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
            </div>

            {/* Full-width toggles */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.abstractFullWidth}
                        onChange={(e) => onChange({ abstractFullWidth: e.target.checked })}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                    />
                    <span className="text-sm text-stone-600">Abstract spans all columns</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.titleFullWidth}
                        onChange={(e) => onChange({ titleFullWidth: e.target.checked })}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                    />
                    <span className="text-sm text-stone-600">Title spans all columns</span>
                </label>
            </div>
        </div>
    );
}
