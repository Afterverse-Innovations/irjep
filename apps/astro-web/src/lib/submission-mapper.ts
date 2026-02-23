import type { StructuredPaperData, PaperEndMatter } from "./paper-data";

/**
 * Maps a Convex submission object to StructuredPaperData.
 * Only pre-fills data that exists on the submission — body starts empty
 * (users add sections, tables, and content freely in the editor).
 *
 * If paperData already has content, it should be used instead (no overwrite).
 */
export function mapSubmissionToPaperData(submission: any): StructuredPaperData {
    const correspondingAuthor = submission.correspondingAuthor;

    return {
        meta: {
            articleType: submission.articleType ?? "",
            receivedDate: submission.createdAt
                ? new Date(submission.createdAt).toISOString().split("T")[0]
                : undefined,
        },
        title: submission.title ?? "",
        authors: [
            // Map corresponding author
            ...(correspondingAuthor
                ? [
                    {
                        name: correspondingAuthor.name,
                        affiliation: "",
                        email: correspondingAuthor.email,
                        isCorresponding: true,
                    },
                ]
                : []),
            // Map research authors
            ...(submission.researchAuthors ?? []).map((a: any) => ({
                name: a.name,
                affiliation: a.affiliation,
                email: undefined,
                isCorresponding: false,
            })),
        ],
        abstract: submission.abstract ?? "",
        keywords: submission.keywords ?? [],
        // Body starts empty — user writes content via rich text editor
        body: "",
        tables: [],
        references: [],
        // Default end-matter with corresponding author pre-filled
        endMatter: {
            contributorParticulars: [],
            correspondingAuthor: {
                name: correspondingAuthor?.name ?? "",
                address: correspondingAuthor?.address ?? "",
                email: correspondingAuthor?.email ?? "",
            },
            authorDeclaration: {
                competingInterests: "None",
                ethicsApproval: "",
                informedConsent: "",
            },
            plagiarismChecking: {
                checkerEntries: [],
            },
            dateOfSubmission: submission.createdAt
                ? new Date(submission.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "",
        },
    };
}
