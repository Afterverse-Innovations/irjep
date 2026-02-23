import type { ReferenceConfig } from "@/lib/template-config";

interface Props {
    config: ReferenceConfig;
    onChange: (v: Partial<ReferenceConfig>) => void;
}

const STYLES = [
    { value: "numbered", label: "Numbered [1]" },
    { value: "apa", label: "APA" },
    { value: "mla", label: "MLA" },
    { value: "chicago", label: "Chicago" },
] as const;

export function ReferenceSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">References</h3>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Numbering Style</label>
                <select
                    value={config.numberingStyle}
                    onChange={(e) => onChange({ numberingStyle: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
                >
                    {STYLES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    Hanging Indent: {config.hangingIndent}mm
                </label>
                <input
                    type="range" min="0" max="20" step="0.5"
                    value={config.hangingIndent}
                    onChange={(e) => onChange({ hangingIndent: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.autoNumbering}
                    onChange={(e) => onChange({ autoNumbering: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-sm text-stone-600">Auto-number references</span>
            </label>
        </div>
    );
}
