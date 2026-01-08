import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx: any) => {
    return await ctx.storage.generateUploadUrl();
});
