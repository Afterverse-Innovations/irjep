import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx: any) => {
        return await ctx.db.query("issues").order("desc").collect();
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        volume: v.number(),
        issueNumber: v.number(),
        publicationDate: v.string(),
    },
    handler: async (ctx: any, args: any) => {
        // In production, check for admin/editor role
        return await ctx.db.insert("issues", {
            title: args.title,
            volume: args.volume,
            issueNumber: args.issueNumber,
            publicationDate: args.publicationDate,
            isPublished: false,
        });
    },
});

export const togglePublish = mutation({
    args: { id: v.id("issues"), isPublished: v.boolean() },
    handler: async (ctx: any, args: any) => {
        await ctx.db.patch(args.id, { isPublished: args.isPublished });
    },
});
