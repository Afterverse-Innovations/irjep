import { mutation } from "./_generated/server";

const MOCK_TITLES = [
    "Phytochemical Analysis of Ayurvedic Herbs",
    "Traditional Medicine in Tribal Communities of South Asia",
    "The Role of Turmeric in Modern Clinical Practice",
    "Ethnobotanical Survey of Medicinal Plants in the Himalayas",
    "Comparative Study of Ancient and Modern Surgical Techniques",
    "Impact of Yoga on Cardiovascular Health: A Meta-Analysis",
    "Preservation of Indigenous Knowledge through Digital Documentation",
    "Antimicrobial Properties of Traditional Neem Extracts",
    "Holistic Approaches to Mental Health in Ethnomedicine",
    "Validation of Traditional Wound Healing Practices",
    "Pharmacognosy of Endangered Medicinal Flora",
    "Socio-Cultural Dimensions of Traditional Healing",
    "Integrating Ayurveda with Modern Oncology",
    "Safety and Efficacy of Polyherbal Formulations",
    "The Science of Pulse Diagnosis in Ancient Texts",
    "Ethnoveterinary Practices in Rural Farming",
    "Metabolic Effects of Panchakarma Therapy",
    "Bioavailability of Bioactive Compounds in Herbal Teas",
    "Standardization of Ayurvedic Bhasmas",
    "Climate Change and its Impact on Medicinal Plant Biodiversity",
    "Regulatory Frameworks for Traditional Medicine Globally",
    "Neuroprotective Potential of Brahmi in Aging Populations"
];

const MOCK_ABSTRACTS = [
    "This study explores the chemical composition and therapeutic potential of several key herbs used in traditional Ayurvedic medicine, focusing on their antioxidant properties.",
    "A comprehensive review of healing practices among isolated tribal groups, emphasizing the transition from oral tradition to documented knowledge.",
    "Recent clinical trials have shed light on the molecular mechanisms of curcumin, validating centuries-old claims about its anti-inflammatory benefits.",
    "Field research conducted over 18 months identified over 45 previously undocumented medicinal plant species used by local healers for respiratory ailments.",
    "An interdisciplinary analysis comparing the 'Sushruta Samhita' with contemporary reconstructive surgical methods, identifying surprising parallels.",
    "Yoga as a therapeutic intervention shows significant promise in reducing arterial stiffness and improving autonomic tone in hypertensive patients.",
    "The rapid loss of elder knowledge necessitates urgent digital archiving. This paper presents a framework for culturally sensitive documentation.",
    "Laboratory tests demonstrate that standardized neem leaf extracts exhibit potent inhibitory effects against several drug-resistant bacterial strains.",
    "Traditional healing systems offer a unique person-centered approach to emotional well-being that complements modern psychological frameworks.",
    "This research quantifies the healing rates of traditional topical applications compared to standard saline dressings in a controlled setting.",
    "We investigate the microscopic and genetic markers of three rare Himalayan species to prevent adulteration in the herbal supply chain.",
    "Understanding the patient-healer relationship within its cultural context is vital for the successful integration of ethnomedicine into national health systems.",
    "A retrospective study on patients using Ayurvedic supportive care alongside chemotherapy, showing improved quality of life metrics.",
    "HPLC analysis was used to ensure consistency across multiple batches of popular herbal combinations, revealing significant variability.",
    "This technical paper deconstructs the physiological correlates of traditional pulse assessment using high-fidelity sensor technology.",
    "Interviews with traditional pastoralists reveal a sophisticated understanding of animal behavior and botany for treating livestock diseases.",
    "Measurement of inflammatory markers before and after a 21-day detox regimen indicates a systemic reduction in oxidative stress levels.",
    "Simulated digestion models show that the presence of fats significantly enhances the intestinal absorption of several key alkaloids.",
    "This paper proposes new X-ray diffraction standards for the quality control of metal-based traditional preparations.",
    "Shifting seasonal patterns are altering the potency and availability of wild-harvested herbs, threatening traditional pharmacy practices.",
    "An overview of the legal status of traditional practitioners in 15 countries, highlighting the need for standardized accreditation.",
    "Animal models treated with standardized Bacopa monnieri extracts showed enhanced synaptic plasticity and reduced beta-amyloid accumulation."
];

const MOCK_AUTHORS = [
    "Dr. Rajesh Sharma", "Sarah Jenkins", "Prof. Anjali Gupta", "Michael Chen",
    "Elena Rodriguez", "Dr. Amit Patel", "Hiroshi Tanaka", "Linda Mbeki",
    "Dr. Sanjay Varma", "Maria Rossi"
];

// Status lifecycle paths for demo data
type SeedStatus = "pending_for_review" | "under_peer_review" | "requested_for_correction" |
    "correction_submitted" | "accepted" | "rejected" | "pre_publication" | "published";

const STATUS_PATHS: { finalStatus: SeedStatus; history: { status: string; note: string }[] }[] = [
    // 1-4: Pending for review
    {
        finalStatus: "pending_for_review",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
        ]
    },
    // 5-7: Under peer review
    {
        finalStatus: "under_peer_review",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
            { status: "under_peer_review", note: "Assigned to peer reviewers for detailed evaluation." },
        ]
    },
    // 8-9: Requested for correction
    {
        finalStatus: "requested_for_correction",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
            { status: "under_peer_review", note: "Assigned to peer reviewers." },
            { status: "requested_for_correction", note: "Reviewers noted issues with methodology section. Please revise tables 3-5 and address statistical concerns." },
        ]
    },
    // 10: Correction submitted
    {
        finalStatus: "correction_submitted",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
            { status: "under_peer_review", note: "Assigned to peer reviewers." },
            { status: "requested_for_correction", note: "Minor revisions needed in the discussion section." },
            { status: "correction_submitted", note: "All requested corrections have been addressed. Revised manuscript attached." },
        ]
    },
    // 11-12: Accepted
    {
        finalStatus: "accepted",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
            { status: "under_peer_review", note: "Assigned to peer reviewers." },
            { status: "accepted", note: "All reviewers recommend acceptance. Paper meets publication standards." },
        ]
    },
    // 13-14: Rejected
    {
        finalStatus: "rejected",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
            { status: "under_peer_review", note: "Assigned to peer reviewers." },
            { status: "rejected", note: "Manuscript does not meet the journal's scope. Authors are encouraged to submit to a more specialized journal." },
        ]
    },
    // 15-17: Pre-publication
    {
        finalStatus: "pre_publication",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
            { status: "under_peer_review", note: "Assigned to peer reviewers." },
            { status: "accepted", note: "Paper accepted for publication." },
            { status: "pre_publication", note: "Typesetting and DOI assignment in progress." },
        ]
    },
    // 18-22: Published
    {
        finalStatus: "published",
        history: [
            { status: "submitted", note: "Manuscript submitted by author." },
            { status: "pending_for_review", note: "Automatically queued for editorial review." },
            { status: "under_peer_review", note: "Assigned to peer reviewers." },
            { status: "accepted", note: "Paper accepted for publication." },
            { status: "pre_publication", note: "Typesetting and DOI assignment in progress." },
            { status: "published", note: "Published in Volume 1. DOI assigned." },
        ]
    },
];

// Map each submission index to a status path
function getStatusPath(index: number) {
    if (index < 4) return STATUS_PATHS[0];      // pending_for_review
    if (index < 7) return STATUS_PATHS[1];      // under_peer_review
    if (index < 9) return STATUS_PATHS[2];      // requested_for_correction
    if (index === 9) return STATUS_PATHS[3];    // correction_submitted
    if (index < 12) return STATUS_PATHS[4];     // accepted
    if (index < 14) return STATUS_PATHS[5];     // rejected
    if (index < 17) return STATUS_PATHS[6];     // pre_publication
    return STATUS_PATHS[7];                      // published
}

export const run = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Create Mock Users
        const userIds = [];
        for (let i = 0; i < 5; i++) {
            const userId = await ctx.db.insert("users", {
                clerkId: `mock_clerk_${i}`,
                email: `scholar_${i}@example.com`,
                name: MOCK_AUTHORS[i],
                role: "author",
                institution: "International Institute of Traditional Medicine",
                bio: "A dedicated researcher in the field of ethnomedicine and ancient healing practices."
            });
            userIds.push(userId);
        }

        // Create an editor user for history records
        const editorId = await ctx.db.insert("users", {
            clerkId: "mock_clerk_editor",
            email: "editor@irjep.org",
            name: "Dr. Editorial Board",
            role: "editor",
            institution: "IRJEP Editorial Office",
        });

        // 2. Create 3 Issues
        const issue1 = await ctx.db.insert("issues", {
            title: "Volume 1, Issue 1: Foundations of Ethnomedicine",
            volume: 1,
            issueNumber: 1,
            publicationDate: "January - March 2025",
            isPublished: true,
        });

        const issue2 = await ctx.db.insert("issues", {
            title: "Volume 1, Issue 2: Herbal Pharmacology",
            volume: 1,
            issueNumber: 2,
            publicationDate: "April - June 2025",
            isPublished: true,
        });

        const issue3 = await ctx.db.insert("issues", {
            title: "Volume 1, Issue 3: Integrative Practices",
            volume: 1,
            issueNumber: 3,
            publicationDate: "July - September 2025",
            isPublished: false,
        });

        const issues = [issue1, issue2, issue3];

        // 3. Create 22 Submissions with lifecycle history
        for (let i = 0; i < MOCK_TITLES.length; i++) {
            const authorId = userIds[i % userIds.length];
            const authorName = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
            const statusPath = getStatusPath(i);

            const baseTime = Date.now() - (Math.random() * 1000000000);

            // Create Submission with the final status
            const submissionId = await ctx.db.insert("submissions", {
                title: MOCK_TITLES[i],
                abstract: MOCK_ABSTRACTS[i],
                articleType: "Research Article",
                authorId: authorId,
                correspondingAuthor: {
                    name: authorName,
                    address: "123 University Road, Research City",
                    email: `scholar_${i % 5}@example.com`,
                    phone: "+91-9876543210",
                },
                researchAuthors: [
                    { name: authorName, affiliation: "International Institute of Traditional Medicine" },
                    { name: MOCK_AUTHORS[(i + 1) % MOCK_AUTHORS.length], affiliation: "Global Health Research Center" },
                ],
                keywords: ["Ethnomedicine", "Traditional Practice", "Research"],
                copyrightFileId: "mock_copyright_file",
                manuscriptFileId: "mock_manuscript_file",
                status: statusPath.finalStatus,
                version: 1,
                createdAt: baseTime,
                updatedAt: baseTime + (statusPath.history.length * 86400000),
            });

            // Insert history records
            for (let h = 0; h < statusPath.history.length; h++) {
                const historyEntry = statusPath.history[h];
                const prevStatus = h > 0 ? statusPath.history[h - 1].status : undefined;

                // Determine who made the change
                let changedByUserId = editorId;
                let changedByRole: "editor" | "author" | "system" = "editor";

                if (historyEntry.status === "submitted" || historyEntry.status === "pending_for_review") {
                    changedByUserId = authorId;
                    changedByRole = "system";
                } else if (historyEntry.status === "correction_submitted") {
                    changedByUserId = authorId;
                    changedByRole = "author";
                }

                await ctx.db.insert("manuscript_status_history", {
                    manuscriptId: submissionId,
                    previousStatus: prevStatus,
                    newStatus: historyEntry.status,
                    changedByUserId,
                    changedByRole,
                    note: historyEntry.note,
                    createdAt: baseTime + (h * 86400000), // Each status change ~1 day apart
                });
            }

            // Create Article for published submissions
            if (statusPath.finalStatus === "published" && i >= 17) {
                const issueId = issues[i % 2];
                await ctx.db.insert("articles", {
                    submissionId,
                    issueId,
                    title: MOCK_TITLES[i],
                    authors: [authorName],
                    pageRange: `${(i * 10) + 1}-${(i * 10) + 10}`,
                    doi: `10.5555/irjep.2025.${i}`,
                    publishDate: Date.now() - (Math.random() * 500000000),
                    slug: MOCK_TITLES[i].toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, ""),
                    views: Math.floor(Math.random() * 5000),
                    downloads: Math.floor(Math.random() * 1000),
                });
            }
        }

        return "Successfully seeded 6 users (5 authors + 1 editor), 3 issues, 22 papers across all lifecycle stages, and full status history.";
    },
});
