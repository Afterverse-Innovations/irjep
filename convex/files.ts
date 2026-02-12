import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx: any) => {
    return await ctx.storage.generateUploadUrl();
});

export const getUrl = query({
    args: { storageId: v.optional(v.string()) },
    handler: async (ctx: any, args: any) => {
        if (!args.storageId) return null;
        return await ctx.storage.getUrl(args.storageId);
    },
});
