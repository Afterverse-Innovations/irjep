import { useMemo } from "react";
import type { JournalTemplateConfig } from "@/lib/template-config";

/**
 * Converts a JournalTemplateConfig into a CSS string that can be injected
 * as a <style> block. Uses CSS custom properties for easy cascading.
 *
 * Performance: memoized — only re-computes when config changes.
 */
export function useTemplateStyles(config: JournalTemplateConfig): string {
  return useMemo(() => generateTemplateCSS(config), [config]);
}

// ─── Page size lookup (mm) ───────────────────────────────────
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

  // Content area height = page height minus top/bottom margins
  const contentHeight = pageHeight - page.margins.top - page.margins.bottom;

  // Content area width = page width minus left/right margins
  const contentWidth = pageWidth - page.margins.left - page.margins.right;
  // Single column width (for accurate block measurement)
  const colWidth = (contentWidth - (layout.columnCount - 1) * layout.columnGap) / layout.columnCount;

  return `
/* ─── Template CSS (auto-generated) ─────────────────────────── */

/* ─── Paged Wrapper (multi-page simulation) ──────────────── */
.paper-paged-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.paper-page {
  --page-width: ${pageWidth}mm;
  --page-height: ${pageHeight}mm;
  --content-height: ${contentHeight}mm;
  --margin-top: ${page.margins.top}mm;
  --margin-right: ${page.margins.right}mm;
  --margin-bottom: ${page.margins.bottom}mm;
  --margin-left: ${page.margins.left}mm;
  --bg-color: ${page.backgroundColor};

  --font-family: ${typography.baseFontFamily};
  --font-size: ${typography.baseFontSize}pt;
  --line-height: ${typography.baseLineHeight};
  --text-align: ${typography.textAlign};

  --col-count: ${layout.columnCount};
  --col-gap: ${layout.columnGap}mm;

  width: var(--page-width);
  height: var(--page-height);
  padding: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left);
  background: var(--bg-color);
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  text-align: var(--text-align);
  color: #000;
  box-sizing: border-box;
  position: relative;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);

  /* Flex column: header at top, footer at bottom, content fills middle */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Measurement container — same styles but auto height */
.paper-measure {
  height: auto !important;
  overflow: visible !important;
  display: block !important;
  box-shadow: none !important;
}

/* Title block: spans all columns on page 1 */
.paper-title-block {
  margin-bottom: ${spacing.betweenSections}mm;
}

/* Measurement body — no columns here; each section has its own columns */
.paper-measure-body {
  /* sections inside handle their own columns */
}

/* Clip container — fixed height per page, clips overflow */
.paper-page-clip {
  overflow: hidden;
  position: relative;
}

/* Inner body — absolutely positioned, NO columns (sections handle them) */
.paper-page-body-inner {
  position: absolute;
  left: 0;
  right: 0;
}

/* ─── Header ─────────────────────────────────────────────── */
.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${typography.headerFooterFontSize}pt;
  padding-bottom: ${header.paddingBottom}mm;
  margin-bottom: ${header.marginBottom}mm;
  ${header.borderBottom ? `border-bottom: 1px solid ${header.borderColor};` : ""}
  color: #555;
}

/* ─── Footer ─────────────────────────────────────────────── */
.paper-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${typography.headerFooterFontSize}pt;
  padding-top: 3mm;
  margin-top: 5mm;
  ${footer.borderTop ? `border-top: 1px solid ${footer.borderColor};` : ""}
  color: #555;
}

.paper-footer-page-number {
  text-align: ${footer.pageNumberPosition};
  flex: 1;
}

/* ─── Title Block ────────────────────────────────────────── */
.paper-title {
  font-size: ${typography.titleFontSize}pt;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4mm;
  line-height: 1.2;
  ${layout.titleFullWidth ? "column-span: all;" : ""}
}

.paper-authors {
  text-align: center;
  margin-bottom: 2mm;
  font-size: ${typography.baseFontSize}pt;
  ${layout.titleFullWidth ? "column-span: all;" : ""}
}

.paper-affiliations {
  text-align: center;
  font-size: ${typography.baseFontSize - 1}pt;
  font-style: italic;
  margin-bottom: 4mm;
  color: #444;
  ${layout.titleFullWidth ? "column-span: all;" : ""}
}

/* ─── Abstract ───────────────────────────────────────────── */
.paper-abstract-block {
  margin-bottom: ${spacing.betweenSections}mm;
  padding-left: ${abstract.indentLeft}mm;
  padding-right: ${abstract.indentRight}mm;
  font-size: ${typography.baseFontSize + abstract.fontSizeOffset}pt;
  column-span: all;
  ${!layout.abstractFullWidth ? `column-count: ${layout.columnCount}; column-gap: ${layout.columnGap}mm;` : ""}
}

.paper-abstract-label {
  ${abstract.labelBold ? "font-weight: bold;" : ""}
  margin-bottom: 2mm;
  ${!layout.abstractFullWidth ? "column-span: all;" : ""}
}

.paper-keywords {
  font-size: ${typography.baseFontSize - 1}pt;
  margin-top: 3mm;
  column-span: all;
}

.paper-keywords-label {
  font-weight: bold;
  font-style: italic;
}

/* ─── Body Content (Column Layout) ───────────────────────── */
.paper-body {
  column-count: var(--col-count);
  column-gap: var(--col-gap);
}

.paper-section {
  column-count: var(--col-count);
  column-gap: var(--col-gap);
  column-fill: balance;
  margin-bottom: ${spacing.betweenSections}mm;
}

/* Manual page break marker */
.paper-page-break {
  break-before: page;
  page-break-before: always;
  height: 0;
  border: none;
  margin: 0;
}

.paper-section-heading {
  font-size: ${typography.sectionHeadingFontSize}pt;
  font-weight: bold;
  ${typography.sectionHeadingUppercase ? "text-transform: uppercase;" : ""}
  margin-bottom: ${spacing.afterHeading}mm;
}

.paper-paragraph {
  margin-bottom: ${spacing.betweenParagraphs}mm;
  text-indent: 5mm;
}

.paper-paragraph:first-child {
  text-indent: 0;
}

/* ─── Rich Text Content (TipTap output) ──────────────────── */
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

.paper-rich-content strong,
.paper-rich-content b {
  font-weight: bold;
}

.paper-rich-content em,
.paper-rich-content i {
  font-style: italic;
}

.paper-rich-content u {
  text-decoration: underline;
}

.paper-rich-content s,
.paper-rich-content del {
  text-decoration: line-through;
}

.paper-rich-content mark {
  background-color: #fef08a;
  padding: 0 1px;
}

.paper-rich-content sub {
  font-size: 0.75em;
  vertical-align: sub;
}

.paper-rich-content sup {
  font-size: 0.75em;
  vertical-align: super;
}

/* Lists */
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

.paper-rich-content li {
  margin-bottom: 1mm;
}

.paper-rich-content li p {
  margin-bottom: 0;
}

/* Blockquote */
.paper-rich-content blockquote {
  border-left: 2px solid #ccc;
  padding-left: 4mm;
  margin: ${spacing.betweenParagraphs}mm 0;
  font-style: italic;
  color: #444;
}

.paper-rich-content blockquote p {
  margin-bottom: 1mm;
}

/* Code */
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

.paper-rich-content pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

/* Horizontal rule */
.paper-rich-content hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: ${spacing.betweenSections}mm 0;
}

/* Inline tables from TipTap */
.paper-rich-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${spacing.betweenParagraphs}mm;
  font-size: ${typography.tableFontSize}pt;
}

.paper-rich-content table th,
.paper-rich-content table td {
  border: ${table.borderWidth}px solid ${table.borderColor};
  padding: 1.5mm 2mm;
  text-align: left;
}

.paper-rich-content table th {
  background: ${table.headerBackgroundColor};
  color: ${table.headerTextColor};
  font-weight: bold;
}

/* Text alignment from TipTap */
.paper-rich-content [style*="text-align: center"] { text-align: center; }
.paper-rich-content [style*="text-align: right"] { text-align: right; }
.paper-rich-content [style*="text-align: justify"] { text-align: justify; }

/* ─── Tables ─────────────────────────────────────────────── */
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

.paper-table {
  width: 100%;
  border-collapse: collapse;
}

.paper-table th,
.paper-table td {
  border: ${table.borderWidth}px solid ${table.borderColor};
  padding: 1.5mm 2mm;
  text-align: left;
}

.paper-table th {
  background: ${table.headerBackgroundColor};
  color: ${table.headerTextColor};
  font-weight: bold;
}

/* ─── References ─────────────────────────────────────────── */
.paper-references {
  font-size: ${typography.referenceFontSize}pt;
}

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

/* ─── End-Matter Metadata ────────────────────────────────── */
.paper-endmatter {
  margin-top: ${spacing.betweenSections * 2}mm;
  padding-top: ${spacing.betweenSections}mm;
  border-top: 1px solid #ccc;
  font-size: ${typography.baseFontSize - 1}pt;
  column-span: all;
}

.paper-endmatter-section {
  margin-bottom: ${spacing.betweenSections * 0.6}mm;
}

.paper-endmatter-heading {
  font-weight: bold;
  font-size: ${typography.baseFontSize - 1}pt;
  text-transform: uppercase;
  margin-bottom: 1.5mm;
}

.paper-endmatter-item {
  margin-bottom: 1mm;
  padding-left: 2mm;
}

.paper-endmatter-dates {
  margin-top: ${spacing.betweenSections * 0.5}mm;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5mm;
  font-size: ${typography.baseFontSize - 1}pt;
}
`;
}
