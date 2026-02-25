// ─── Template Configuration Types ─────────────────────────────
// These types define the full structure of a journal template.
// Stored as JSON in Convex `templates.config` field.

export interface PageConfig {
    size: "A4" | "Letter" | "A5" | "B5";
    orientation: "portrait" | "landscape";
    margins: {
        top: number;    // mm
        right: number;
        bottom: number;
        left: number;
    };
    backgroundColor: string;
    printBackground: boolean;
}

export interface TypographyConfig {
    baseFontFamily: string;
    baseFontSize: number;      // pt
    baseLineHeight: number;    // unitless multiplier
    titleFontSize: number;
    titleColor: string;
    titleBold: boolean;
    titleItalic: boolean;
    titleUnderline: boolean;
    titleAlign: "left" | "center" | "right" | "justify";
    sectionHeadingFontSize: number;
    sectionHeadingUppercase: boolean;
    sectionHeadingColor: string;
    sectionHeadingBold: boolean;
    sectionHeadingItalic: boolean;
    sectionHeadingUnderline: boolean;
    sectionHeadingAlign: "left" | "center" | "right" | "justify";
    tableFontSize: number;
    referenceFontSize: number;
    headerFooterFontSize: number;
    textAlign: "left" | "justify" | "center";
}

export interface LayoutConfig {
    columnCount: 1 | 2 | 3;
    columnGap: number;          // mm
    abstractFullWidth: boolean;
    titleFullWidth: boolean;
}

export interface HeaderTokenBlock {
    tokens: string[];             // e.g. ["{{journalName}}", " - ", "{{year}}"]
    alignment: "left" | "center" | "right";
}

export interface HeaderConfig {
    blocks: HeaderTokenBlock[];
    borderBottom: boolean;
    borderColor: string;
    paddingBottom: number;        // mm
    marginBottom: number;         // mm
}

export interface FooterConfig {
    leftContent: string;          // token string e.g. "{{journalName}}"
    rightContent: string;
    showPageNumber: boolean;
    pageNumberPosition: "left" | "center" | "right";
    borderTop: boolean;
    borderColor: string;
}

export interface AbstractConfig {
    labelText: string;            // e.g. "Abstract"
    labelBold: boolean;
    indentLeft: number;           // mm
    indentRight: number;          // mm
    fontSizeOffset: number;       // relative to base, e.g. -1 = 1pt smaller
}

export interface TableConfig {
    borderWidth: number;          // px
    borderColor: string;
    headerBackgroundColor: string;
    headerTextColor: string;
    captionPrefix: string;        // e.g. "Table"
    captionItalic: boolean;
    preventBreak: boolean;
}

export interface ReferenceConfig {
    numberingStyle: "numbered" | "apa" | "mla" | "chicago";
    hangingIndent: number;        // mm
    autoNumbering: boolean;
}

export interface NumberingConfig {
    tablePrefix: string;          // e.g. "Table"
    figurePrefix: string;         // e.g. "Figure"
    referenceStartNumber: number;
}

export interface SpacingConfig {
    betweenSections: number;      // mm
    betweenParagraphs: number;    // mm
    afterHeading: number;         // mm
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

/** Root template configuration object */
export interface JournalTemplateConfig {
    page: PageConfig;
    typography: TypographyConfig;
    layout: LayoutConfig;
    header: HeaderConfig;
    footer: FooterConfig;
    abstract: AbstractConfig;
    table: TableConfig;
    reference: ReferenceConfig;
    numbering: NumberingConfig;
    spacing: SpacingConfig;
    printRules: PrintRulesConfig;
    tokens: TokenConfig;
}

// ─── Available Template Tokens ───────────────────────────────
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
