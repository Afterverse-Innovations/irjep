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

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.showMetaHeader}
                        onChange={(e) => onChange({ showMetaHeader: e.target.checked })}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                    />
                    <span className="text-sm text-stone-600">Show DOI & Article Type</span>
                </label>

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

            {/* Separator Line */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.showTitleSeparator}
                        onChange={(e) => onChange({ showTitleSeparator: e.target.checked })}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                    />
                    <span className="text-sm font-semibold text-stone-700">Separator line (below authors)</span>
                </label>

                {config.showTitleSeparator && (
                    <div className="space-y-3 pl-6">
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-stone-500">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.titleSeparatorColor}
                                    onChange={(e) => onChange({ titleSeparatorColor: e.target.value })}
                                    className="w-6 h-6 rounded border cursor-pointer"
                                />
                                <span className="text-[10px] font-mono text-stone-400 uppercase">{config.titleSeparatorColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-stone-500 uppercase mb-1">
                                Thickness: {config.titleSeparatorThickness}mm
                            </label>
                            <input
                                type="range" min="0.1" max="5" step="0.1"
                                value={config.titleSeparatorThickness}
                                onChange={(e) => onChange({ titleSeparatorThickness: Number(e.target.value) })}
                                className="w-full accent-emerald-600"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
