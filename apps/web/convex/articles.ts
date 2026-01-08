import { query } from "./_generated/server";
import { v } from "convex/values";

export const getArticleById = query({
    args: { articleId: v.id("submissions") }, // Currently articles are just submissions with status 'published'
    handler: async (ctx: any, args: any) => {
        return await ctx.db.get(args.articleId);
    },
});

export const getLatestArticles = query({
    args: {},
    handler: async (ctx: any) => {
        return await ctx.db
            .query("submissions")
            .withIndex("by_status", (q: any) => q.eq("status", "published"))
            .order("desc")
            .take(10);
    },
});

export const search = query({
    args: { query: v.string() },
    handler: async (ctx: any, args: any) => {
        if (args.query === "") return [];
        return await ctx.db
            .query("articles")
            .withSearchIndex("search_title", (q: any) => q.search("title", args.query))
            .collect();
    },
});
