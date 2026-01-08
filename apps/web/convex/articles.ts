import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getArticleById = query({
    args: { articleId: v.id("submissions") },
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

export const getArticlesByIssue = query({
    args: { issueId: v.id("issues") },
    handler: async (ctx: any, args: any) => {
        return await ctx.db
            .query("articles")
            .withIndex("by_issue", (q: any) => q.eq("issueId", args.issueId))
            .collect();
    },
});

export const assignToIssue = mutation({
    args: {
        submissionId: v.id("submissions"),
        issueId: v.id("issues"),
        pageRange: v.optional(v.string()),
        doi: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const submission = await ctx.db.get(args.submissionId);
        if (!submission) throw new Error("Submission not found");

        const user = await ctx.db.get(submission.authorId);
        const authorName = user?.name || "Unknown Author";

        // Create article record
        await ctx.db.insert("articles", {
            submissionId: args.submissionId,
            issueId: args.issueId,
            title: submission.title,
            authors: [authorName],
            pageRange: args.pageRange,
            doi: args.doi,
            publishDate: Date.now(),
            slug: submission.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, ""),
        });

        // Update submission status to published
        await ctx.db.patch(args.submissionId, {
            status: "published",
            updatedAt: Date.now(),
        });
    },
});

export const removeFromIssue = mutation({
    args: {
        articleId: v.id("articles"),
    },
    handler: async (ctx: any, args: any) => {
        const article = await ctx.db.get(args.articleId);
        if (!article) throw new Error("Article not found");

        // Set submission back to 'accepted'
        await ctx.db.patch(article.submissionId, {
            status: "accepted",
            updatedAt: Date.now(),
        });

        // Delete article record
        await ctx.db.delete(args.articleId);
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
