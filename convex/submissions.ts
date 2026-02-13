import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const create = mutation({
    args: {
        title: v.string(),
        abstract: v.string(),
        articleType: v.string(),
        correspondingAuthor: v.object({
            name: v.string(),
            address: v.string(),
            email: v.string(),
            phone: v.string(),
        }),
        researchAuthors: v.array(
            v.object({
                name: v.string(),
                affiliation: v.string(),
            })
        ),
        keywords: v.array(v.string()),
        copyrightFileId: v.string(),
        manuscriptFileId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthorized");

        const now = Date.now();

        // Insert submission with initial "submitted" status
        const submissionId = await ctx.db.insert("submissions", {
            title: args.title,
            abstract: args.abstract,
            articleType: args.articleType,
            authorId: user._id,
            correspondingAuthor: args.correspondingAuthor,
            researchAuthors: args.researchAuthors,
            keywords: args.keywords,
            copyrightFileId: args.copyrightFileId,
            manuscriptFileId: args.manuscriptFileId,
            status: "submitted",
            version: 1,
            createdAt: now,
            updatedAt: now,
        });

        // Record initial "submitted" history entry
        await ctx.db.insert("manuscript_status_history", {
            manuscriptId: submissionId,
            previousStatus: undefined,
            newStatus: "submitted",
            changedByUserId: user._id,
            changedByRole: "system",
            note: "Manuscript submitted by author.",
            createdAt: now,
        });

        // Auto-transition to "pending_for_review"
        await ctx.db.patch(submissionId, {
            status: "pending_for_review",
            updatedAt: now + 1,
        });

        await ctx.db.insert("manuscript_status_history", {
            manuscriptId: submissionId,
            previousStatus: "submitted",
            newStatus: "pending_for_review",
            changedByUserId: user._id,
            changedByRole: "system",
            note: "Automatically queued for editorial review.",
            createdAt: now + 1,
        });

        return submissionId;
    },
});

export const getMySubmissions = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) return [];

        return await ctx.db
            .query("submissions")
            .withIndex("by_author", (q) => q.eq("authorId", user._id))
            .collect();
    },
});

/**
 * Returns all submissions for editor/admin dashboard.
 * Optionally filtered by status. Enriched with author name.
 */
export const getAllSubmissions = query({
    args: {
        statusFilter: v.optional(v.string()),
    },
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        // Only editors and admins can see all submissions
        if (!user || (user.role !== "editor" && user.role !== "admin")) {
            return [];
        }

        const submissions = await ctx.db.query("submissions").collect();

        const enriched = await Promise.all(
            submissions.map(async (sub) => {
                const author = await ctx.db.get(sub.authorId);
                return {
                    ...sub,
                    authorName: author?.name ?? "Unknown",
                    authorEmail: author?.email ?? "",
                };
            })
        );

        // Sort by updatedAt descending (most recent first)
        enriched.sort((a, b) => b.updatedAt - a.updatedAt);

        return enriched;
    },
});

export const getPendingSubmissions = query({
    args: {},
    handler: async (ctx) => {
        const submissions = await ctx.db
            .query("submissions")
            .withIndex("by_status", (q) => q.eq("status", "submitted"))
            .collect();

        const results = await Promise.all(submissions.map(async (sub) => {
            const user = await ctx.db.get(sub.authorId);
            return {
                ...sub,
                authorName: user?.name,
                authorId: user?._id,
            };
        }));

        return results;
    },
});

export const updateStatus = mutation({
    args: {
        submissionId: v.id("submissions"),
        status: v.union(
            v.literal("under_peer_review"),
            v.literal("accepted"),
            v.literal("rejected"),
            v.literal("published")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.submissionId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});

export const getAcceptedSubmissions = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("submissions")
            .withIndex("by_status", (q) => q.eq("status", "accepted"))
            .collect();
    },
});

export const getById = query({
    args: { id: v.id("submissions") },
    handler: async (ctx, args) => {
        const submission = await ctx.db.get(args.id);
        if (!submission) return null;

        const author = await ctx.db.get(submission.authorId);

        return {
            ...submission,
            authorName: author?.name ?? "Unknown",
            authorEmail: author?.email ?? "",
        };
    },
});
