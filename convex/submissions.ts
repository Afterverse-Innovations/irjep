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

        return await ctx.db.insert("submissions", {
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
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
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
            v.literal("under_review"),
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
        return await ctx.db.get(args.id);
    },
});
