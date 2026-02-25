import type { EndMatterConfig } from "@/lib/template-config";

interface Props {
    config: EndMatterConfig;
    onChange: (v: Partial<EndMatterConfig>) => void;
}

export function EndMatterSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Metadata (End Matter)</h3>
            <p className="text-xs text-stone-400">
                Settings for Particulars of Contributors, Author Declaration, and other metadata sections.
            </p>

            {/* Border Top */}
            <div className="space-y-2 p-3 bg-stone-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.showBorderTop}
                        onChange={(e) => onChange({ showBorderTop: e.target.checked })}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                    />
                    <span className="text-xs text-stone-600">Show border above end matter</span>
                </label>

                {config.showBorderTop && (
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-stone-600">Border Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={config.borderColor}
                                onChange={(e) => onChange({ borderColor: e.target.value })}
                                className="w-8 h-8 rounded border cursor-pointer p-0.5"
                            />
                            <span className="text-[10px] font-mono text-stone-400 uppercase">
                                {config.borderColor}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Heading Uppercase */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.headingUppercase}
                    onChange={(e) => onChange({ headingUppercase: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-xs text-stone-600">Uppercase headings</span>
            </label>

            {/* Separate Page Threshold */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    Force to new page when larger than: {Math.round(config.separatePageThreshold * 100)}%
                </label>
                <p className="text-[10px] text-stone-400 mb-2">
                    If end matter exceeds this % of the page content area, it moves to its own page.
                </p>
                <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.05"
                    value={config.separatePageThreshold}
                    onChange={(e) => onChange({ separatePageThreshold: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                    <span>20%</span>
                    <span>90%</span>
                </div>
            </div>
        </div>
    );
}
