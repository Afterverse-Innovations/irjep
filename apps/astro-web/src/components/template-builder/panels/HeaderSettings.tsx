import type { HeaderConfig } from "@/lib/template-config";
import { AVAILABLE_TOKENS } from "@/lib/template-config";

interface Props {
    config: HeaderConfig;
    onChange: (v: Partial<HeaderConfig>) => void;
}

export function HeaderSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Header</h3>

            {/* Left Content */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Left Content</label>
                <input
                    type="text"
                    value={config.leftContent || ""}
                    onChange={(e) => onChange({ leftContent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-mono"
                    placeholder="e.g. {{journalName}}"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                    {AVAILABLE_TOKENS.slice(0, 8).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => onChange({ leftContent: (config.leftContent || "") + t.key })}
                            className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Content */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Right Content</label>
                <input
                    type="text"
                    value={config.rightContent || ""}
                    onChange={(e) => onChange({ rightContent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-mono"
                    placeholder="Vol. {{volume}}"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                    {AVAILABLE_TOKENS.slice(0, 8).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => onChange({ rightContent: (config.rightContent || "") + t.key })}
                            className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Border */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.borderBottom}
                        onChange={(e) => onChange({ borderBottom: e.target.checked })}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                    />
                    <span className="text-sm text-stone-600">Bottom border</span>
                </label>

                {config.borderBottom && (
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-stone-500">Color:</label>
                        <input
                            type="color"
                            value={config.borderColor}
                            onChange={(e) => onChange({ borderColor: e.target.value })}
                            className="w-6 h-6 rounded border cursor-pointer"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                        Padding Bottom: {config.paddingBottom}mm
                    </label>
                    <input
                        type="range" min="0" max="15" step="0.5"
                        value={config.paddingBottom}
                        onChange={(e) => onChange({ paddingBottom: Number(e.target.value) })}
                        className="w-full accent-emerald-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                        Margin Bottom: {config.marginBottom}mm
                    </label>
                    <input
                        type="range" min="0" max="20" step="0.5"
                        value={config.marginBottom}
                        onChange={(e) => onChange({ marginBottom: Number(e.target.value) })}
                        className="w-full accent-emerald-600"
                    />
                </div>
            </div>
        </div>
    );
}
