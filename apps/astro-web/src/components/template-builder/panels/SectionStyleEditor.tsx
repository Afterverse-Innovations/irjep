import type { SectionStyle, BoxSpacing } from "@/lib/template-config";

const ZERO_BOX: BoxSpacing = { top: 0, right: 0, bottom: 0, left: 0 };
const SIDES = ["top", "right", "bottom", "left"] as const;
const SIDE_LABELS = { top: "T", right: "R", bottom: "B", left: "L" } as const;

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

const ALIGN_OPTIONS = ["left", "center", "right", "justify"] as const;
const ALIGN_LABELS = { left: "L", center: "C", right: "R", justify: "J" } as const;

interface Props {
    /** Resolved style (global merged with section override) for display */
    resolved: SectionStyle;
    /** Only the section-level overrides */
    override: Partial<SectionStyle>;
    /** Update function — receives partial section overrides */
    onChange: (patch: Partial<SectionStyle>) => void;
    /** Whether to show font-family selector (usually only on global) */
    showFontFamily?: boolean;
    /** Whether to show line-height control */
    showLineHeight?: boolean;
    /** Min/max for font size slider */
    fontSizeRange?: [number, number];
}

function BoxInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: BoxSpacing;
    onChange: (v: BoxSpacing) => void;
}) {
    return (
        <div className="space-y-1">
            <div className="text-xs font-medium text-stone-600">{label}</div>
            <div className="grid grid-cols-4 gap-1.5">
                {SIDES.map((side) => (
                    <div key={side} className="flex flex-col items-center">
                        <label className="text-[10px] text-stone-400 mb-0.5">
                            {SIDE_LABELS[side]}
                        </label>
                        <input
                            type="number"
                            max="30"
                            step="0.5"
                            value={value[side]}
                            onChange={(e) =>
                                onChange({ ...value, [side]: Number(e.target.value) })
                            }
                            className="w-full px-1 py-1 text-xs text-center rounded border border-stone-200
                                       focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SectionStyleEditor({
    resolved,
    override,
    onChange,
    showFontFamily = false,
    showLineHeight = false,
    fontSizeRange = [6, 28],
}: Props) {
    const sz = override?.fontSize ?? resolved.fontSize;

    return (
        <div className="space-y-3">
            {/* Font family (only shown for global or when requested) */}
            {showFontFamily && (
                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Font Family</label>
                    <select
                        value={resolved.fontFamily}
                        onChange={(e) => onChange({ fontFamily: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
                    >
                        {FONT_FAMILIES.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Font size */}
            <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                    Size: {sz}pt
                </label>
                <input
                    type="range"
                    min={fontSizeRange[0]}
                    max={fontSizeRange[1]}
                    step="0.5"
                    value={sz}
                    onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                />
            </div>

            {/* Color + B / I / U */}
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-stone-600">Color</label>
                <input
                    type="color"
                    value={resolved.fontColor}
                    onChange={(e) => onChange({ fontColor: e.target.value })}
                    className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5"
                />
                <div className="inline-flex rounded-lg overflow-hidden border border-stone-200 ml-auto">
                    {([
                        ["bold", "B", "font-bold"] as const,
                        ["italic", "I", "italic"] as const,
                        ["underline", "U", "underline"] as const,
                    ]).map(([key, label, style], idx) => (
                        <button
                            key={key}
                            onClick={() => onChange({ [key]: !resolved[key] })}
                            className={`w-8 h-8 text-xs font-medium transition-colors
                                ${style === "font-bold" ? "font-bold" : ""}
                                ${style === "italic" ? "italic" : ""}
                                ${style === "underline" ? "underline" : ""}
                                ${idx > 0 ? "border-l border-stone-200" : ""}
                                ${resolved[key]
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-white text-stone-500 hover:bg-stone-50"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-stone-600">Align</label>
                <div className="inline-flex rounded-lg overflow-hidden border border-stone-200 ml-auto">
                    {ALIGN_OPTIONS.map((val, idx) => (
                        <button
                            key={val}
                            onClick={() => onChange({ textAlign: val })}
                            className={`w-8 h-8 text-xs font-medium transition-colors
                                ${idx > 0 ? "border-l border-stone-200" : ""}
                                ${resolved.textAlign === val
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-white text-stone-500 hover:bg-stone-50"
                                }`}
                        >
                            {ALIGN_LABELS[val]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Uppercase toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={resolved.uppercase}
                    onChange={(e) => onChange({ uppercase: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300"
                />
                <span className="text-xs text-stone-600">Uppercase</span>
            </label>

            {/* Line height (when shown) */}
            {showLineHeight && (
                <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                        Line Height: {resolved.lineHeight}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.05"
                        value={resolved.lineHeight}
                        onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
                        className="w-full accent-emerald-600"
                    />
                </div>
            )}

            {/* Background color */}
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-stone-600">Background</label>
                <input
                    type="color"
                    value={
                        !resolved.backgroundColor || resolved.backgroundColor === "transparent"
                            ? "#ffffff"
                            : resolved.backgroundColor
                    }
                    onChange={(e) => onChange({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5"
                />
                {resolved.backgroundColor && resolved.backgroundColor !== "transparent" && (
                    <button
                        onClick={() => onChange({ backgroundColor: "transparent" })}
                        className="text-[10px] text-stone-400 hover:text-stone-600 underline"
                    >
                        Clear
                    </button>
                )}
            </div>
            {/* Margin */}
            <BoxInput
                label="Margin (mm)"
                value={resolved.margin}
                onChange={(v) => onChange({ margin: v })}
            />

            {/* Padding */}
            <BoxInput
                label="Padding (mm)"
                value={resolved.padding}
                onChange={(v) => onChange({ padding: v })}
            />
        </div>
    );
}
