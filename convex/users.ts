import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const viewer = query({
    args: {},
    handler: async (ctx: any) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
            .first();
    },
});

/**
 * Helper to get the current user or create one if they don't exist.
 */
export async function getCurrentUser(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    let user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .first();

    if (!user) {
        // Bootstrap: First user to register becomes admin
        const firstUser = await ctx.db.query("users").first();
        const role = firstUser === null ? "admin" : "author";

        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            email: identity.email ?? "no-email@provided.com",
            name: identity.name ?? identity.nickname ?? "Scholar",
            role,
        });
        user = await ctx.db.get(userId);
    }

    return user;
}

export const syncUser = mutation({
    args: {
        name: v.optional(v.string()),
        email: v.string(),
    },
    handler: async (ctx: any, args: any) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Called syncUser without auth");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
            .first();

        if (user) {
            // Update existing user info if needed
            await ctx.db.patch(user._id, {
                email: args.email,
                name: args.name || user.name,
            });
            return user._id;
        }

        // Bootstrap: First user to register becomes admin
        const firstUser = await ctx.db.query("users").first();
        const role = firstUser === null ? "admin" : "author";

        return await ctx.db.insert("users", {
            clerkId: identity.subject,
            email: args.email,
            name: args.name,
            role,
        });
    },
});

export const list = query({
    args: {},
    handler: async (ctx: any) => {
        return await ctx.db.query("users").collect();
    },
});

export const setRole = mutation({
    args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.literal("editor"), v.literal("author")) },
    handler: async (ctx: any, args: any) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // In production, check if the caller is admin here!

        await ctx.db.patch(args.userId, { role: args.role });
    },
});

export const getAuthorById = query({
    args: { userId: v.id("users") },
    handler: async (ctx: any, args: any) => {
        return await ctx.db.get(args.userId);
    },
});

export const getAuthorArticles = query({
    args: { authorId: v.id("users") },
    handler: async (ctx: any, args: any) => {
        // This is more complex if we have multiple authors per article
        // For now, let's assume one main author or search by author name
        // A better way would be an 'author_articles' join table

        // Simple mock: query submissions by author that are 'published'
        return await ctx.db
            .query("submissions")
            .withIndex("by_author", (q: any) => q.eq("authorId", args.authorId))
            .filter((q: any) => q.eq(q.field("status"), "published"))
            .collect();
    },
});
