import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const create = mutation({
    args: {
        title: v.string(),
        abstract: v.string(),
        fileId: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthorized");

        return await ctx.db.insert("submissions", {
            title: args.title,
            abstract: args.abstract,
            authorId: user._id,
            fileId: args.fileId,
            status: "submitted",
            version: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const getMySubmissions = query({
    args: {},
    handler: async (ctx: any) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) return [];

        return await ctx.db
            .query("submissions")
            .withIndex("by_author", (q: any) => q.eq("authorId", user._id))
            .collect();
    },
});

export const getPendingSubmissions = query({
    args: {},
    handler: async (ctx: any) => {
        // In production, check if caller is Editor or Admin
        return await ctx.db
            .query("submissions")
            .withIndex("by_status", (q: any) => q.eq("status", "submitted"))
            .collect();
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
    handler: async (ctx: any, args: any) => {
        // In production, check auth
        await ctx.db.patch(args.submissionId, {
            status: args.status,
            updatedAt: Date.now(),
        });

        if (args.status === "published") {
            // Logic to create 'article' entry from submission would go here (now handled by articles:assignToIssue)
        }
    },
});

export const getAcceptedSubmissions = query({
    args: {},
    handler: async (ctx: any) => {
        return await ctx.db
            .query("submissions")
            .withIndex("by_status", (q: any) => q.eq("status", "accepted"))
            .collect();
    },
});

export const getById = query({
    args: { id: v.id("submissions") },
    handler: async (ctx: any, args: any) => {
        return await ctx.db.get(args.id);
    },
});
