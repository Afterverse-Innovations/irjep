import { query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx: any) => {
        return await ctx.db.query("issues").order("desc").collect();
    },
});
