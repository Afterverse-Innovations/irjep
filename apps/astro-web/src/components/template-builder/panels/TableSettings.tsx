import type { TableConfig } from "@/lib/template-config";

interface Props {
    config: TableConfig;
    onChange: (v: Partial<TableConfig>) => void;
}

export function TableSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Table Styling</h3>

            {/* Border */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    Border Width: {config.borderWidth}px
                </label>
                <input
                    type="range" min="0" max="3" step="0.5"
                    value={config.borderWidth}
                    onChange={(e) => onChange({ borderWidth: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Border Color</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color" value={config.borderColor}
                        onChange={(e) => onChange({ borderColor: e.target.value })}
                        className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-stone-500">{config.borderColor}</span>
                </div>
            </div>

            {/* Header Background */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Header Background</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color" value={config.headerBackgroundColor}
                        onChange={(e) => onChange({ headerBackgroundColor: e.target.value })}
                        className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-stone-500">{config.headerBackgroundColor}</span>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Header Text Color</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color" value={config.headerTextColor}
                        onChange={(e) => onChange({ headerTextColor: e.target.value })}
                        className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-stone-500">{config.headerTextColor}</span>
                </div>
            </div>

            {/* Caption */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Caption Prefix</label>
                <input
                    type="text" value={config.captionPrefix}
                    onChange={(e) => onChange({ captionPrefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    placeholder="Table"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox" checked={config.captionItalic}
                    onChange={(e) => onChange({ captionItalic: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-sm text-stone-600">Italic caption</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox" checked={config.preventBreak}
                    onChange={(e) => onChange({ preventBreak: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-sm text-stone-600">Prevent page break inside table</span>
            </label>
        </div>
    );
}
