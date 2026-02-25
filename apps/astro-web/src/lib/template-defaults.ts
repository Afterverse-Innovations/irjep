import type { JournalTemplateConfig, SectionStyle, BoxSpacing } from "./template-config";

const Z: BoxSpacing = { top: 0, right: 0, bottom: 0, left: 0 };

/** Global baseline style — every section inherits from this */
const GLOBAL_STYLE: SectionStyle = {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: 10,
    fontColor: "#000000",
    bold: false,
    italic: false,
    underline: false,
    uppercase: false,
    textAlign: "justify",
    backgroundColor: "transparent",
    lineHeight: 1.4,
    margin: Z,
    padding: Z,
};

/**
 * Default template config — sensible academic journal defaults.
 * Used as the starting point when creating a new template.
 */
export const DEFAULT_TEMPLATE_CONFIG: JournalTemplateConfig = {
    page: {
        size: "A4",
        orientation: "portrait",
        margins: { top: 25, right: 20, bottom: 25, left: 20 },
        backgroundColor: "#ffffff",
        printBackground: false,
    },

    global: GLOBAL_STYLE,

    sections: {
        title: {
            fontSize: 18,
            bold: true,
            textAlign: "center",
            lineHeight: 1.2,
            margin: { top: 0, right: 0, bottom: 4, left: 0 },
        },
        authors: {
            textAlign: "center",
            margin: { top: 0, right: 0, bottom: 2, left: 0 },
        },
        affiliations: {
            italic: true,
            fontSize: 9,
            fontColor: "#444444",
            textAlign: "center",
            margin: { top: 0, right: 0, bottom: 4, left: 0 },
        },
        abstract: {
            margin: { top: 0, right: 0, bottom: 8, left: 0 },
        },
        keywords: {
            fontSize: 9,
            italic: true,
            margin: { top: 0, right: 0, bottom: 8, left: 0 },
        },
        sectionHeadings: {
            fontSize: 12,
            bold: true,
            uppercase: true,
            textAlign: "left",
        },
        bodyText: {},
        references: {
            fontSize: 9,
        },
        tables: {
            fontSize: 9,
        },
        header: {
            fontSize: 8,
            fontColor: "#555555",
        },
        footer: {
            fontSize: 8,
            fontColor: "#555555",
        },
    },

    layout: {
        columnCount: 2,
        columnGap: 6,
        abstractFullWidth: false,
        titleFullWidth: true,
        showTitleSeparator: true,
        titleSeparatorColor: "#0000ff", // Blue
        titleSeparatorThickness: 1,      // 1mm
        showMetaHeader: true,
    },

    header: {
        leftContent: "{{journalName}}",
        rightContent: "Vol. {{volume}}, Issue {{issue}}, {{year}}",
        borderBottom: true,
        borderColor: "#cccccc",
        paddingBottom: 3,
        marginBottom: 5,
    },

    footer: {
        leftContent: "{{journalName}}",
        rightContent: "",
        showPageNumber: true,
        pageNumberPosition: "center",
        borderTop: true,
        borderColor: "#cccccc",
    },

    abstractLabel: {
        labelText: "Abstract",
        labelBold: true,
    },

    table: {
        borderWidth: 1,
        borderColor: "#000000",
        headerBackgroundColor: "#f5f5f5",
        headerTextColor: "#000000",
        lastRowBackgroundColor: "transparent",
        lastRowFontColor: "#000000",
        captionPrefix: "Table",
        captionItalic: false,
        preventBreak: true,
    },

    reference: {
        numberingStyle: "numbered",
        hangingIndent: 8,
        autoNumbering: true,
        numberingColor: "#000000",
    },

    numbering: {
        tablePrefix: "Table",
        figurePrefix: "Figure",
        referenceStartNumber: 1,
    },

    spacing: {
        betweenSections: 8,
        betweenParagraphs: 3,
        afterHeading: 4,
    },

    printRules: {
        pageBreakBeforeSections: false,
        avoidBreakInsideParagraphs: true,
    },

    tokens: {
        journalName: "International Research Journal of Ethnomedicine and Practices",
        journalAbbreviation: "IRJEP",
        issn: "",
    },
};
