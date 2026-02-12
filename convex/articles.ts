import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getArticleById = query({
    args: { articleId: v.string() }, // Support both article ID and string-based ID
    handler: async (ctx: any, args: any) => {
        // Try to get by article ID first
        let article = await ctx.db.get(args.articleId as any);

        // If not found, check if it's a submission ID (for backward compatibility during migration)
        if (!article) {
            article = await ctx.db
                .query("articles")
                .withIndex("by_issue") // Just a scan if no specialized index, but let's be safe
                .filter((q: any) => q.eq(q.field("submissionId"), args.articleId))
                .first();
        }

        if (!article) return null;

        const submission = await ctx.db.get(article.submissionId);
        const issue = await ctx.db.get(article.issueId);

        return {
            ...article,
            abstract: submission?.abstract,
            keywords: submission?.keywords,
            fileId: submission?.fileId,
            authorId: submission?.authorId,
            issueTitle: issue?.title,
            issueVolume: issue?.volume,
            issueNumber: issue?.issueNumber,
            isIssuePublished: issue?.isPublished,
        };
    },
});

export const getLatestArticles = query({
    args: {},
    handler: async (ctx: any) => {
        const articles = await ctx.db
            .query("articles")
            .order("desc")
            .collect();

        const results = [];
        for (const art of articles) {
            const issue = await ctx.db.get(art.issueId);
            if (issue?.isPublished) {
                const sub = await ctx.db.get(art.submissionId);
                results.push({
                    ...art,
                    abstract: sub?.abstract,
                    authorId: sub?.authorId
                });
            }
            if (results.length >= 10) break;
        }

        return results;
    },
});

export const trackView = mutation({
    args: { articleId: v.id("articles") },
    handler: async (ctx: any, args: any) => {
        const article = await ctx.db.get(args.articleId);
        if (article) {
            await ctx.db.patch(args.articleId, { views: (article.views || 0) + 1 });
        }
    },
});

export const trackDownload = mutation({
    args: { articleId: v.id("articles") },
    handler: async (ctx: any, args: any) => {
        const article = await ctx.db.get(args.articleId);
        if (article) {
            await ctx.db.patch(args.articleId, { downloads: (article.downloads || 0) + 1 });
        }
    },
});

export const getArticlesByIssue = query({
    args: { issueId: v.id("issues") },
    handler: async (ctx: any, args: any) => {
        const issue = await ctx.db.get(args.issueId);
        if (!issue?.isPublished) return [];

        const articles = await ctx.db
            .query("articles")
            .withIndex("by_issue", (q: any) => q.eq("issueId", args.issueId))
            .collect();

        const results = await Promise.all(articles.map(async (art: any) => {
            const sub = await ctx.db.get(art.submissionId);
            return {
                ...art,
                authorId: sub?.authorId,
            };
        }));

        return results;
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
            views: 0,
            downloads: 0,
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
        const articles = await ctx.db
            .query("articles")
            .withSearchIndex("search_title", (q: any) => q.search("title", args.query))
            .take(50);

        const results = [];
        for (const art of articles) {
            const issue = await ctx.db.get(art.issueId);
            if (issue?.isPublished) {
                const sub = await ctx.db.get(art.submissionId);
                results.push({
                    ...art,
                    abstract: sub?.abstract,
                    authorId: sub?.authorId
                });
            }
        }

        return results.slice(0, 20);
    },
});
