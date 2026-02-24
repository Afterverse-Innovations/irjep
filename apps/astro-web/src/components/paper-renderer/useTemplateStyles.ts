import { useMemo } from "react";
import type { JournalTemplateConfig } from "@/lib/template-config";

export function useTemplateStyles(config: JournalTemplateConfig): string {
  return useMemo(() => generateTemplateCSS(config), [config]);
}

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  A5: { width: 148, height: 210 },
  B5: { width: 176, height: 250 },
};

export function generateTemplateCSS(config: JournalTemplateConfig): string {
  const { page, typography, layout, header, footer, abstract, table, reference, spacing } = config;

  const pageSize = PAGE_SIZES[page.size] ?? PAGE_SIZES.A4;
  const isLandscape = page.orientation === "landscape";
  const pageWidth = isLandscape ? pageSize.height : pageSize.width;
  const pageHeight = isLandscape ? pageSize.width : pageSize.height;

  return `
/* ═══════════════════════════════════════════════════════════
   Template CSS — Column-fill: auto pagination
   ═══════════════════════════════════════════════════════════ */

.paper-paged-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.paper-page {
  width: ${pageWidth}mm;
  height: ${pageHeight}mm;
  padding: ${page.margins.top}mm ${page.margins.right}mm ${page.margins.bottom}mm ${page.margins.left}mm;
  background: ${page.backgroundColor};
  font-family: ${typography.baseFontFamily};
  font-size: ${typography.baseFontSize}pt;
  line-height: ${typography.baseLineHeight};
  text-align: ${typography.textAlign};
  color: #000;
  box-sizing: border-box;
  position: relative;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Measurement container */
.paper-measure {
  height: auto !important;
  overflow: visible !important;
  display: block !important;
  box-shadow: none !important;
}

/* ═══════════════════════════════════════════════════════════
   BODY COLUMNS — the key to correct pagination.
   column-fill: auto fills LEFT column first, then RIGHT.
   With margin-top offset, each page restarts from the left.
   ═══════════════════════════════════════════════════════════ */
.paper-body-columns {
  column-count: ${layout.columnCount};
  column-gap: ${layout.columnGap}mm;
  column-fill: auto;
  overflow: hidden;
  margin-top: 3mm;
}

/* ─── Header ───────────────────────────────────────────────── */
.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${typography.headerFooterFontSize}pt;
  padding-bottom: ${(header.paddingBottom + header.marginBottom) * 0.25}mm;
  ${header.borderBottom ? `border-bottom: 1px solid ${header.borderColor};` : ""}
  color: #555;
  flex-shrink: 0;
}

/* ─── Footer ───────────────────────────────────────────────── */
.paper-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${typography.headerFooterFontSize}pt;
  padding-top: 2mm;
  ${footer.borderTop ? `border-top: 1px solid ${footer.borderColor};` : ""}
  color: #555;
  flex-shrink: 0;
  margin-top: auto;
}

.paper-footer-page-number {
  text-align: ${footer.pageNumberPosition};
  flex: 1;
}

/* ─── Title Block (page 1, outside columns) ────────────────── */
.paper-title-block {
  padding-bottom: 0mm;
}

.paper-title {
  font-size: ${typography.titleFontSize}pt;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4mm;
  line-height: 1.2;
}

.paper-authors {
  text-align: center;
  margin-bottom: 2mm;
  font-size: ${typography.baseFontSize}pt;
}

.paper-affiliations {
  text-align: center;
  font-size: ${typography.baseFontSize - 1}pt;
  font-style: italic;
  margin-bottom: 4mm;
  color: #444;
}

/* Abstract — own 2-column section between title and keywords */
.paper-abstract-columns {
  column-count: ${layout.columnCount};
  column-gap: ${layout.columnGap}mm;
  column-fill: balance;
  margin-bottom: ${spacing.betweenSections}mm;
  padding-left: ${abstract.indentLeft}mm;
  padding-right: ${abstract.indentRight}mm;
  font-size: ${typography.baseFontSize + abstract.fontSizeOffset}pt;
}

.paper-abstract-label {
  ${abstract.labelBold ? "font-weight: bold;" : ""}
  margin-bottom: 2mm;
  column-span: all;
}

.paper-keywords {
  font-size: ${typography.baseFontSize - 1}pt;
  margin-bottom: ${spacing.betweenSections}mm;
}

.paper-keywords-label {
  font-weight: bold;
  font-style: italic;
}

/* ─── Abstract ─────────────────────────────────────────────── */
.paper-abstract-block {
  margin-bottom: ${spacing.betweenSections}mm;
  font-size: ${typography.baseFontSize + abstract.fontSizeOffset}pt;
}

.paper-abstract-label {
  ${abstract.labelBold ? "font-weight: bold;" : ""}
  margin-bottom: 2mm;
}

/* ─── Body Section ─────────────────────────────────────────── */
.paper-body-section {
  margin-bottom: ${spacing.betweenSections}mm;
}

/* ─── Rich Text Content ────────────────────────────────────── */
.paper-rich-content {
  margin-bottom: ${spacing.betweenParagraphs}mm;
}
.paper-rich-content p {
  margin-bottom: ${spacing.betweenParagraphs}mm;
  text-indent: 0;
}
.paper-rich-content h1 {
  font-size: ${typography.sectionHeadingFontSize + 2}pt;
  font-weight: bold;
  margin-top: ${spacing.betweenSections}mm;
  margin-bottom: ${spacing.afterHeading}mm;
}
.paper-rich-content h2 {
  font-size: ${typography.sectionHeadingFontSize}pt;
  font-weight: bold;
  margin-top: ${spacing.betweenSections * 0.8}mm;
  margin-bottom: ${spacing.afterHeading}mm;
}
.paper-rich-content h3 {
  font-size: ${typography.sectionHeadingFontSize - 1}pt;
  font-weight: bold;
  margin-top: ${spacing.betweenSections * 0.6}mm;
  margin-bottom: ${spacing.afterHeading * 0.75}mm;
}
.paper-rich-content h4 {
  font-size: ${typography.baseFontSize}pt;
  font-weight: bold;
  font-style: italic;
  margin-top: ${spacing.betweenSections * 0.4}mm;
  margin-bottom: ${spacing.afterHeading * 0.5}mm;
}
.paper-rich-content strong, .paper-rich-content b { font-weight: bold; }
.paper-rich-content em, .paper-rich-content i { font-style: italic; }
.paper-rich-content u { text-decoration: underline; }
.paper-rich-content s, .paper-rich-content del { text-decoration: line-through; }
.paper-rich-content mark { background-color: #fef08a; padding: 0 1px; }
.paper-rich-content sub { font-size: 0.75em; vertical-align: sub; }
.paper-rich-content sup { font-size: 0.75em; vertical-align: super; }
.paper-rich-content ul {
  list-style-type: disc;
  padding-left: 6mm;
  margin-bottom: ${spacing.betweenParagraphs}mm;
}
.paper-rich-content ol {
  list-style-type: decimal;
  padding-left: 6mm;
  margin-bottom: ${spacing.betweenParagraphs}mm;
}
.paper-rich-content li { margin-bottom: 1mm; }
.paper-rich-content li p { margin-bottom: 0; }
.paper-rich-content blockquote {
  border-left: 2px solid #ccc;
  padding-left: 4mm;
  margin: ${spacing.betweenParagraphs}mm 0;
  font-style: italic;
  color: #444;
}
.paper-rich-content blockquote p { margin-bottom: 1mm; }
.paper-rich-content code {
  font-family: "Courier New", Courier, monospace;
  font-size: ${typography.baseFontSize - 1}pt;
  background: #f5f5f5;
  padding: 0.5mm 1mm;
  border-radius: 1mm;
}
.paper-rich-content pre {
  background: #f5f5f5;
  padding: 3mm;
  border-radius: 1.5mm;
  margin-bottom: ${spacing.betweenParagraphs}mm;
  overflow-x: auto;
  font-size: ${typography.baseFontSize - 1}pt;
}
.paper-rich-content pre code { background: none; padding: 0; border-radius: 0; }
.paper-rich-content hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: ${spacing.betweenSections}mm 0;
}
.paper-rich-content table,
.paper-rich-content .tiptap-table {
  border-collapse: collapse;
  margin-bottom: ${spacing.betweenParagraphs}mm;
  font-size: ${typography.tableFontSize}pt;
  line-height: 1.1;
}
.paper-rich-content table th,
.paper-rich-content table td {
  border: ${table.borderWidth}px solid ${table.borderColor};
  padding: 0.5mm 0.8mm;
  text-align: left;
  vertical-align: top;
  line-height: 1.1;
}
.paper-rich-content table th {
  background: ${table.headerBackgroundColor};
  color: ${table.headerTextColor};
  font-weight: bold;
}
.paper-rich-content table td p,
.paper-rich-content table th p {
  margin-bottom: 1mm;
}
.paper-rich-content table td p:last-child,
.paper-rich-content table th p:last-child {
  margin-bottom: 0;
}
.paper-rich-content p.table-caption,
.paper-rich-content .table-caption {
  text-align: center;
  font-size: ${typography.tableFontSize}pt;
  ${table.captionItalic ? "font-style: italic;" : ""}
  margin: 2mm 0 1mm;
}
.paper-rich-content .tableWrapper { overflow-x: auto; margin: 2mm 0; }
.paper-rich-content .page-break,
.paper-rich-content div[data-page-break] { height: 0; border: none; margin: 0; }
.paper-rich-content [style*="text-align: center"] { text-align: center; }
.paper-rich-content [style*="text-align: right"] { text-align: right; }
.paper-rich-content [style*="text-align: justify"] { text-align: justify; }

/* ─── Tables (structured) ──────────────────────────────────── */
.paper-table-block {
  margin-bottom: ${spacing.betweenSections}mm;
  ${table.preventBreak ? "break-inside: avoid;" : ""}
  font-size: ${typography.tableFontSize}pt;
}
.paper-table-caption {
  text-align: center;
  margin-bottom: 2mm;
  ${table.captionItalic ? "font-style: italic;" : ""}
}
.paper-table { width: 100%; border-collapse: collapse; }
.paper-table th, .paper-table td {
  border: ${table.borderWidth}px solid ${table.borderColor};
  padding: 1.5mm 2mm;
  text-align: left;
}
.paper-table th {
  background: ${table.headerBackgroundColor};
  color: ${table.headerTextColor};
  font-weight: bold;
}

/* ─── References ───────────────────────────────────────────── */
.paper-references { font-size: ${typography.referenceFontSize}pt; }
.paper-references-heading {
  font-size: ${typography.sectionHeadingFontSize}pt;
  font-weight: bold;
  ${typography.sectionHeadingUppercase ? "text-transform: uppercase;" : ""}
  margin-bottom: ${spacing.afterHeading}mm;
}
.paper-reference-item {
  padding-left: ${reference.hangingIndent}mm;
  text-indent: -${reference.hangingIndent}mm;
  margin-bottom: 1.5mm;
}

/* ─── End-Matter ───────────────────────────────────────────── */
.paper-endmatter {
  margin-top: ${spacing.betweenSections}mm;
  padding-top: ${spacing.betweenSections}mm;
  border-top: 1px solid #ccc;
  font-size: ${typography.baseFontSize - 1}pt;
}
.paper-endmatter-section { margin-bottom: ${spacing.betweenSections * 0.6}mm; }
.paper-endmatter-heading {
  font-weight: bold;
  font-size: ${typography.baseFontSize - 1}pt;
  text-transform: uppercase;
  margin-bottom: 1.5mm;
}
.paper-endmatter-item { margin-bottom: 1mm; padding-left: 2mm; }
.paper-endmatter-dates {
  margin-top: ${spacing.betweenSections * 0.5}mm;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5mm;
  font-size: ${typography.baseFontSize - 1}pt;
}
`;
}
