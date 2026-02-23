import { useState } from "react";
import type { HeaderConfig, HeaderTokenBlock } from "@/lib/template-config";
import { AVAILABLE_TOKENS } from "@/lib/template-config";
import { Plus, X, GripVertical } from "lucide-react";

interface Props {
    config: HeaderConfig;
    onChange: (v: Partial<HeaderConfig>) => void;
}

export function HeaderSettings({ config, onChange }: Props) {
    const updateBlock = (index: number, updates: Partial<HeaderTokenBlock>) => {
        const newBlocks = [...config.blocks];
        newBlocks[index] = { ...newBlocks[index], ...updates };
        onChange({ blocks: newBlocks });
    };

    const addBlock = () => {
        onChange({
            blocks: [...config.blocks, { tokens: ["{{journalName}}"], alignment: "center" }],
        });
    };

    const removeBlock = (index: number) => {
        onChange({ blocks: config.blocks.filter((_, i) => i !== index) });
    };

    const addTokenToBlock = (blockIndex: number, tokenKey: string) => {
        const block = config.blocks[blockIndex];
        updateBlock(blockIndex, { tokens: [...block.tokens, tokenKey] });
    };

    const removeTokenFromBlock = (blockIndex: number, tokenIndex: number) => {
        const block = config.blocks[blockIndex];
        updateBlock(blockIndex, {
            tokens: block.tokens.filter((_, i) => i !== tokenIndex),
        });
    };

    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Header</h3>

            {/* Header Blocks */}
            {config.blocks.map((block, bi) => (
                <div key={bi} className="p-3 bg-stone-50 rounded-lg space-y-3 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-stone-400">
                            <GripVertical size={14} />
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Block {bi + 1}</span>
                        </div>
                        <button
                            onClick={() => removeBlock(bi)}
                            className="text-stone-400 hover:text-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex gap-1">
                        {(["left", "center", "right"] as const).map((a) => (
                            <button
                                key={a}
                                onClick={() => updateBlock(bi, { alignment: a })}
                                className={`flex-1 py-1 rounded text-[10px] font-medium ${block.alignment === a
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-white text-stone-500 border border-stone-200"
                                    }`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    {/* Current Tokens */}
                    <div className="flex flex-wrap gap-1">
                        {block.tokens.map((token, ti) => (
                            <span
                                key={ti}
                                className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-mono"
                            >
                                {token}
                                <button
                                    onClick={() => removeTokenFromBlock(bi, ti)}
                                    className="text-emerald-400 hover:text-red-500"
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Add Token */}
                    <select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) addTokenToBlock(bi, e.target.value);
                        }}
                        className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs bg-white"
                    >
                        <option value="">+ Add token...</option>
                        {AVAILABLE_TOKENS.map((t) => (
                            <option key={t.key} value={t.key}>{t.label}</option>
                        ))}
                    </select>
                </div>
            ))}

            <button
                onClick={addBlock}
                className="flex items-center gap-1.5 w-full py-2 px-3 rounded-lg border border-dashed border-stone-300 text-stone-500 text-xs font-medium hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
                <Plus size={14} /> Add Header Block
            </button>

            {/* Border */}
            <div className="space-y-3 pt-2">
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
