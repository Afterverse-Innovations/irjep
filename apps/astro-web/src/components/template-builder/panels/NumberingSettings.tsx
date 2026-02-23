import type { NumberingConfig } from "@/lib/template-config";

interface Props {
    config: NumberingConfig;
    onChange: (v: Partial<NumberingConfig>) => void;
}

export function NumberingSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Numbering</h3>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Table Prefix</label>
                <input
                    type="text" value={config.tablePrefix}
                    onChange={(e) => onChange({ tablePrefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    placeholder="Table"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Figure Prefix</label>
                <input
                    type="text" value={config.figurePrefix}
                    onChange={(e) => onChange({ figurePrefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    placeholder="Figure"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Reference Start Number</label>
                <input
                    type="number" min="1" value={config.referenceStartNumber}
                    onChange={(e) => onChange({ referenceStartNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
            </div>
        </div>
    );
}
