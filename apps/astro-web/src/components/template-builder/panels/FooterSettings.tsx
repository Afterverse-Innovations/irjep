import type { FooterConfig } from "@/lib/template-config";
import { AVAILABLE_TOKENS } from "@/lib/template-config";

interface Props {
    config: FooterConfig;
    onChange: (v: Partial<FooterConfig>) => void;
}

export function FooterSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Footer</h3>

            {/* Left Content */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Left Content</label>
                <input
                    type="text"
                    value={config.leftContent}
                    onChange={(e) => onChange({ leftContent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-mono"
                    placeholder="e.g. {{journalName}}"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                    {AVAILABLE_TOKENS.slice(0, 8).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => onChange({ leftContent: config.leftContent + t.key })}
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
                    value={config.rightContent}
                    onChange={(e) => onChange({ rightContent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-mono"
                    placeholder="e.g. {{year}}"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                    {AVAILABLE_TOKENS.slice(0, 8).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => onChange({ rightContent: config.rightContent + t.key })}
                            className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Page Number */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.showPageNumber}
                    onChange={(e) => onChange({ showPageNumber: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-sm text-stone-600">Show page number</span>
            </label>

            {config.showPageNumber && (
                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Page Number Position</label>
                    <div className="flex gap-2">
                        {(["left", "center", "right"] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => onChange({ pageNumberPosition: p })}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${config.pageNumberPosition === p
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                    : "bg-stone-50 text-stone-500 hover:bg-stone-100"
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Border */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.borderTop}
                    onChange={(e) => onChange({ borderTop: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-sm text-stone-600">Top border</span>
            </label>

            {config.borderTop && (
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
        </div>
    );
}
