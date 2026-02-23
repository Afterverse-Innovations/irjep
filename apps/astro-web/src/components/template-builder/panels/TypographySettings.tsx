import type { TypographyConfig } from "@/lib/template-config";

interface Props {
    config: TypographyConfig;
    onChange: (v: Partial<TypographyConfig>) => void;
}

const FONT_FAMILIES = [
    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Garamond", value: "Garamond, serif" },
    { label: "Palatino", value: "'Palatino Linotype', Palatino, serif" },
    { label: "Arial", value: "Arial, Helvetica, sans-serif" },
    { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Computer Modern", value: "'CMU Serif', 'Computer Modern', serif" },
];

const ALIGN_OPTIONS = ["left", "justify", "center"] as const;

export function TypographySettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Typography</h3>

            {/* Global Settings */}
            <div className="space-y-3 p-3 bg-stone-50 rounded-lg">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Global</div>

                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Base Font</label>
                    <select
                        value={config.baseFontFamily}
                        onChange={(e) => onChange({ baseFontFamily: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
                    >
                        {FONT_FAMILIES.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                        Base Size: {config.baseFontSize}pt
                    </label>
                    <input
                        type="range" min="7" max="16" step="0.5"
                        value={config.baseFontSize}
                        onChange={(e) => onChange({ baseFontSize: Number(e.target.value) })}
                        className="w-full accent-emerald-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                        Line Height: {config.baseLineHeight}
                    </label>
                    <input
                        type="range" min="1" max="2.5" step="0.05"
                        value={config.baseLineHeight}
                        onChange={(e) => onChange({ baseLineHeight: Number(e.target.value) })}
                        className="w-full accent-emerald-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Text Alignment</label>
                    <div className="flex gap-2">
                        {ALIGN_OPTIONS.map((a) => (
                            <button
                                key={a}
                                onClick={() => onChange({ textAlign: a })}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${config.textAlign === a
                                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                        : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
                                    }`}
                            >
                                {a.charAt(0).toUpperCase() + a.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Per-Element Sizes */}
            <div className="space-y-3 p-3 bg-stone-50 rounded-lg">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Element Sizes</div>

                {([
                    ["titleFontSize", "Title", 12, 28],
                    ["sectionHeadingFontSize", "Section Heading", 8, 18],
                    ["tableFontSize", "Table Text", 6, 14],
                    ["referenceFontSize", "Reference Text", 6, 14],
                    ["headerFooterFontSize", "Header/Footer", 6, 12],
                ] as const).map(([key, label, min, max]) => (
                    <div key={key}>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                            {label}: {config[key]}pt
                        </label>
                        <input
                            type="range" min={min} max={max} step="0.5"
                            value={config[key]}
                            onChange={(e) => onChange({ [key]: Number(e.target.value) } as any)}
                            className="w-full accent-emerald-600"
                        />
                    </div>
                ))}

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                        type="checkbox"
                        checked={config.sectionHeadingUppercase}
                        onChange={(e) => onChange({ sectionHeadingUppercase: e.target.checked })}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                    />
                    <span className="text-xs text-stone-600">Section headings uppercase</span>
                </label>
            </div>
        </div>
    );
}
