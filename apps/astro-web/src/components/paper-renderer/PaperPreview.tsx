import { useState, useRef, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, Printer } from "lucide-react";
import type { JournalTemplateConfig } from "@/lib/template-config";
import type { StructuredPaperData } from "@/lib/paper-data";
import { TemplateRenderer } from "./TemplateRenderer";
import { generateTemplateCSS } from "./useTemplateStyles";

// ─── Page size lookup (mm) — for @page CSS ───────────────────
const PAGE_SIZES: Record<string, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
    A5: { width: 148, height: 210 },
    B5: { width: 176, height: 250 },
};

interface PaperPreviewProps {
    config: JournalTemplateConfig;
    data: StructuredPaperData;
}

/**
 * Preview wrapper — adds zoom controls, scales paper, and provides
 * print-in-new-tab functionality. Used by Template Builder and Paper Generator.
 */
export function PaperPreview({ config, data }: PaperPreviewProps) {
    const [zoom, setZoom] = useState(0.55);
    const previewRef = useRef<HTMLDivElement>(null);

    const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5));
    const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.2));
    const fitToView = () => setZoom(0.55);

    // ─── Open in new tab for printing ────────────────────────
    const openPrintPreview = useCallback(() => {
        const ps = PAGE_SIZES[config.page.size] ?? PAGE_SIZES.A4;
        const isLandscape = config.page.orientation === "landscape";
        const pageW = isLandscape ? ps.height : ps.width;
        const pageH = isLandscape ? ps.width : ps.height;

        // Generate the template CSS
        const templateCSS = generateTemplateCSS(config);

        // Grab the rendered paper HTML from the visible preview
        const paperHTML = previewRef.current?.innerHTML ?? "";

        // Build the print page
        const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Print Preview — ${data.title || "Untitled Paper"}</title>
    <style>
        /* Reset */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Template styles */
        ${templateCSS}

        /* ─── Screen styles ─────────────────────────────── */
        body {
            background: #e5e5e5;
            padding: 24px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .print-toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 12px 24px;
            background: #1c1917;
            color: #fff;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            z-index: 100;
            box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        .print-toolbar button {
            padding: 8px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }

        .print-btn {
            background: #059669;
            color: white;
        }
        .print-btn:hover { background: #047857; }

        .close-btn {
            background: #57534e;
            color: white;
        }
        .close-btn:hover { background: #78716c; }

        .print-info {
            color: #a8a29e;
            font-size: 12px;
        }

        .paper-paged-wrapper {
            margin-top: 72px;
        }

        /* ─── Print styles ──────────────────────────────── */
        @page {
            size: ${pageW}mm ${pageH}mm;
            margin: 0;
        }

        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }

            .print-toolbar {
                display: none !important;
            }

            .paper-paged-wrapper {
                margin-top: 0;
                gap: 0;
            }

            .paper-page {
                box-shadow: none;
                page-break-after: always;
                break-after: page;
                margin: 0;
            }

            .paper-page:last-child {
                page-break-after: auto;
                break-after: auto;
            }

            /* Hide measurement container in print */
            .paper-measure {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="print-toolbar">
        <span class="print-info">${config.page.size} · ${config.page.orientation} · ${data.title || "Untitled Paper"}</span>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
    </div>
    ${paperHTML}
</body>
</html>`;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(printHTML);
            printWindow.document.close();
        }
    }, [config, data]);

    return (
        <div className="flex flex-col h-full">
            {/* Zoom controls */}
            <div className="flex items-center gap-2 p-3 border-b border-stone-200 bg-white sticky top-0 z-10">
                <button
                    onClick={zoomOut}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut size={16} />
                </button>
                <span className="text-xs font-medium text-stone-600 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={zoomIn}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn size={16} />
                </button>
                <button
                    onClick={fitToView}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
                    title="Fit to Window"
                >
                    <Maximize2 size={16} />
                </button>

                <div className="flex-1" />

                <span className="text-[10px] text-stone-400">
                    {config.page.size} · {config.page.orientation}
                </span>

                <button
                    onClick={openPrintPreview}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                    title="Open in new tab for printing"
                >
                    <Printer size={14} />
                    Print
                </button>
            </div>

            {/* Scaled paper preview */}
            <div className="flex-1 overflow-auto bg-stone-200/50 p-6">
                <div
                    ref={previewRef}
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "top center",
                    }}
                >
                    <TemplateRenderer config={config} data={data} />
                </div>
            </div>
        </div>
    );
}
