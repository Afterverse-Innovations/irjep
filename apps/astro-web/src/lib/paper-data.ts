// ─── Structured Paper Data Types ──────────────────────────────
// These types define the content structure of a rendered paper.
// Stored as JSON in Convex `papers.renderedData` field.

export interface PaperMeta {
    doi?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    receivedDate?: string;
    acceptedDate?: string;
    publishedDate?: string;
    articleType?: string;
}

export interface PaperAuthor {
    name: string;
    affiliation: string;
    email?: string;
    isCorresponding: boolean;
}

export interface PaperSection {
    heading: string;
    content: string;           // HTML content
    columns?: boolean;         // true = use template column layout, false = single column (default: true)
    subsections?: PaperSection[];
}

export interface PaperTable {
    number: number;
    caption: string;
    headers: string[];
    rows: string[][];
    notes?: string;
}

export interface PaperReference {
    number: number;
    text: string;               // Formatted reference text
}

// ─── End-Matter Metadata (rendered at bottom of paper) ────────

/** Individual contributor entry with designation */
export interface ContributorParticular {
    number: number;
    designation: string;       // e.g. "Senior Resident, Department of Pharmacology, ..."
}

export interface CorrespondingAuthorInfo {
    name: string;
    address: string;
    email: string;
}

export interface AuthorDeclaration {
    competingInterests: string;
    ethicsApproval: string;
    informedConsent: string;
}

export interface PlagiarismCheck {
    checkerEntries: { method: string; date: string }[];
    imageConsent?: string;
}

export interface PaperEndMatter {
    contributorParticulars: ContributorParticular[];
    correspondingAuthor: CorrespondingAuthorInfo;
    authorDeclaration: AuthorDeclaration;
    plagiarismChecking: PlagiarismCheck;
    pharmacology?: string;      // e.g. "Author Origin"
    emendations?: string;       // e.g. "7"
    dateOfSubmission?: string;
    dateOfPeerReview?: string;
    dateOfAcceptance?: string;
    dateOfPublishing?: string;
}

/** Root structured paper data */
export interface StructuredPaperData {
    meta: PaperMeta;
    title: string;
    authors: PaperAuthor[];
    abstract: string;            // HTML content
    keywords: string[];
    body: PaperSection[];
    tables: PaperTable[];
    references: PaperReference[];
    endMatter?: PaperEndMatter;
}
