import type { JournalTemplateConfig } from "./template-config";

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

    typography: {
        baseFontFamily: "'Times New Roman', Times, serif",
        baseFontSize: 10,
        baseLineHeight: 1.4,
        titleFontSize: 18,
        titleColor: "#000000",
        titleBold: true,
        titleItalic: false,
        titleUnderline: false,
        titleAlign: "center",
        sectionHeadingFontSize: 12,
        sectionHeadingUppercase: true,
        sectionHeadingColor: "#000000",
        sectionHeadingBold: true,
        sectionHeadingItalic: false,
        sectionHeadingUnderline: false,
        sectionHeadingAlign: "left",
        tableFontSize: 9,
        referenceFontSize: 9,
        headerFooterFontSize: 8,
        textAlign: "justify",
    },

    layout: {
        columnCount: 2,
        columnGap: 6,
        abstractFullWidth: false,
        titleFullWidth: true,
    },

    header: {
        blocks: [
            {
                tokens: ["{{journalName}}"],
                alignment: "left",
            },
            {
                tokens: ["Vol. {{volume}}, Issue {{issue}}, {{year}}"],
                alignment: "right",
            },
        ],
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

    abstract: {
        labelText: "Abstract",
        labelBold: true,
        indentLeft: 10,
        indentRight: 10,
        fontSizeOffset: 0,
    },

    table: {
        borderWidth: 1,
        borderColor: "#000000",
        headerBackgroundColor: "#f5f5f5",
        headerTextColor: "#000000",
        captionPrefix: "Table",
        captionItalic: false,
        preventBreak: true,
    },

    reference: {
        numberingStyle: "numbered",
        hangingIndent: 8,
        autoNumbering: true,
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
        journalName: "International Research Journal of Education and Practice",
        journalAbbreviation: "IRJEP",
        issn: "",
    },
};
