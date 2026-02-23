import type { SpacingConfig } from "@/lib/template-config";

interface Props {
    config: SpacingConfig;
    onChange: (v: Partial<SpacingConfig>) => void;
}

export function SpacingSettings({ config, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Spacing</h3>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    Between Sections: {config.betweenSections}mm
                </label>
                <input
                    type="range" min="2" max="30" step="0.5"
                    value={config.betweenSections}
                    onChange={(e) => onChange({ betweenSections: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    Between Paragraphs: {config.betweenParagraphs}mm
                </label>
                <input
                    type="range" min="0" max="15" step="0.5"
                    value={config.betweenParagraphs}
                    onChange={(e) => onChange({ betweenParagraphs: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    After Heading: {config.afterHeading}mm
                </label>
                <input
                    type="range" min="1" max="15" step="0.5"
                    value={config.afterHeading}
                    onChange={(e) => onChange({ afterHeading: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
            </div>
        </div>
    );
}
