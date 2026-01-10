import { mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const run = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Create Mock Users (if they don't exist, we'll just create a few seed ones)
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
            isPublished: false, // Keeping one as draft
        });

        const issues = [issue1, issue2, issue3];

        // 3. Create 22 Submissions and link them as Articles
        for (let i = 0; i < MOCK_TITLES.length; i++) {
            const authorId = userIds[i % userIds.length];
            const authorName = MOCK_AUTHORS[i % MOCK_AUTHORS.length];

            // Create Submission
            const submissionId = await ctx.db.insert("submissions", {
                title: MOCK_TITLES[i],
                abstract: MOCK_ABSTRACTS[i],
                authorId: authorId,
                status: "published",
                version: 1,
                keywords: ["Ethnomedicine", "Traditional Practice", "Research"],
                createdAt: Date.now() - (Math.random() * 1000000000),
                updatedAt: Date.now(),
            });

            // Create Article for the first 15 (spread across 2 published issues)
            if (i < 15) {
                const issueId = issues[i % 2]; // Assign to Issue 1 or 2
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
            } else if (i < 20) {
                // Assign 5 to the draft issue (Issue 3)
                await ctx.db.insert("articles", {
                    submissionId,
                    issueId: issues[2],
                    title: MOCK_TITLES[i],
                    authors: [authorName],
                    pageRange: `${(i * 10) + 1}-${(i * 10) + 10}`,
                    doi: `10.5555/irjep.2025.${i}`,
                    publishDate: Date.now(),
                    slug: MOCK_TITLES[i].toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, ""),
                    views: 0,
                    downloads: 0,
                });
            }
            // The remaining 2 stay as just submissions with 'published' status but no article link yet
        }

        return "Successfully seeded 5 users, 3 issues, and 22 papers.";
    },
});
