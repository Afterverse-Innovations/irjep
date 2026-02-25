// ─── Template Configuration Types (Section-based Architecture) ─────
// Each section has a uniform SectionStyle. Global defaults cascade
// into per-section overrides.  Stored as JSON in Convex `templates.config`.

// ─── Reusable primitives ────────────────────────────────────────────

export interface BoxSpacing {
    top: number;       // mm
    right: number;
    bottom: number;
    left: number;
}

export const ZERO_BOX: BoxSpacing = { top: 0, right: 0, bottom: 0, left: 0 };

/** Style properties that any section can have */
export interface SectionStyle {
    fontFamily: string;
    fontSize: number;              // pt
    fontColor: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    uppercase: boolean;
    textAlign: "left" | "center" | "right" | "justify";
    backgroundColor: string;
    lineHeight: number;            // unitless multiplier
    margin: BoxSpacing;            // mm
    padding: BoxSpacing;           // mm
}

/** Merge global + override → resolved style */
export function resolveStyle(
    global: SectionStyle,
    override?: Partial<SectionStyle>,
): SectionStyle {
    const base = global || {};
    const over = override || {};
    return {
        ...base,
        ...over,
        margin: over.margin ?? base.margin ?? ZERO_BOX,
        padding: over.padding ?? base.padding ?? ZERO_BOX,
    } as SectionStyle;
}

// ─── Section keys ───────────────────────────────────────────────────

export const SECTION_KEYS = [
    "title",
    "authors",
    "affiliations",
    "abstract",
    "keywords",
    "sectionHeadings",
    "bodyText",
    "references",
    "tables",
    "header",
    "footer",
] as const;

export type SectionKey = typeof SECTION_KEYS[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
    title: "Title",
    authors: "Authors",
    affiliations: "Affiliations",
    abstract: "Abstract",
    keywords: "Keywords",
    sectionHeadings: "Section Headings",
    bodyText: "Body Text",
    references: "References",
    tables: "Tables",
    header: "Header",
    footer: "Footer",
};

// ─── Non-style configs (structural / behavioural) ───────────────────

export interface PageConfig {
    size: "A4" | "Letter" | "A5" | "B5";
    orientation: "portrait" | "landscape";
    margins: BoxSpacing;
    backgroundColor: string;
    printBackground: boolean;
}

export interface LayoutConfig {
    columnCount: 1 | 2 | 3;
    columnGap: number;              // mm
    abstractFullWidth: boolean;
    titleFullWidth: boolean;
}

export interface HeaderTokenBlock {
    tokens: string[];
    alignment: "left" | "center" | "right";
}

export interface HeaderConfig {
    blocks: HeaderTokenBlock[];
    borderBottom: boolean;
    borderColor: string;
    paddingBottom: number;          // mm
    marginBottom: number;           // mm
}

export interface FooterConfig {
    leftContent: string;
    rightContent: string;
    showPageNumber: boolean;
    pageNumberPosition: "left" | "center" | "right";
    borderTop: boolean;
    borderColor: string;
}

export interface AbstractLabelConfig {
    labelText: string;
    labelBold: boolean;
}

export interface TableConfig {
    borderWidth: number;            // px
    borderColor: string;
    headerBackgroundColor: string;
    headerTextColor: string;
    captionPrefix: string;
    captionItalic: boolean;
    preventBreak: boolean;
}

export interface ReferenceConfig {
    numberingStyle: "numbered" | "apa" | "mla" | "chicago";
    hangingIndent: number;          // mm
    autoNumbering: boolean;
}

export interface NumberingConfig {
    tablePrefix: string;
    figurePrefix: string;
    referenceStartNumber: number;
}

export interface SpacingConfig {
    betweenSections: number;        // mm
    betweenParagraphs: number;      // mm
    afterHeading: number;           // mm
}

export interface PrintRulesConfig {
    pageBreakBeforeSections: boolean;
    avoidBreakInsideParagraphs: boolean;
}

export interface TokenConfig {
    journalName: string;
    journalAbbreviation: string;
    issn: string;
}

// ─── Root config ────────────────────────────────────────────────────

export interface JournalTemplateConfig {
    page: PageConfig;
    global: SectionStyle;
    sections: Record<SectionKey, Partial<SectionStyle>>;
    layout: LayoutConfig;
    header: HeaderConfig;
    footer: FooterConfig;
    abstractLabel: AbstractLabelConfig;
    table: TableConfig;
    reference: ReferenceConfig;
    numbering: NumberingConfig;
    spacing: SpacingConfig;
    printRules: PrintRulesConfig;
    tokens: TokenConfig;
}

// ─── Available Template Tokens ──────────────────────────────────────

export const AVAILABLE_TOKENS = [
    { key: "{{journalName}}", label: "Journal Name" },
    { key: "{{year}}", label: "Year" },
    { key: "{{doi}}", label: "DOI" },
    { key: "{{sectionName}}", label: "Section Name" },
    { key: "{{pageNumber}}", label: "Page Number" },
    { key: "{{volume}}", label: "Volume" },
    { key: "{{issue}}", label: "Issue" },
    { key: "{{issn}}", label: "ISSN" },
] as const;
