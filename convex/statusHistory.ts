import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Returns all status history records for a manuscript, ordered by createdAt
 * ascending (oldest first). Each record is enriched with the user's name.
 */
export const getBySubmission = query({
    args: { submissionId: v.id("submissions") },
    handler: async (ctx, args) => {
        const records = await ctx.db
            .query("manuscript_status_history")
            .withIndex("by_manuscript", (q) =>
                q.eq("manuscriptId", args.submissionId)
            )
            .collect();

        // Sort ascending by createdAt (oldest first for timeline)
        records.sort((a, b) => a.createdAt - b.createdAt);

        // Enrich with user names and attachment URLs
        const enriched = await Promise.all(
            records.map(async (record) => {
                const user = await ctx.db.get(record.changedByUserId);
                let attachmentUrl: string | null = null;
                if (record.attachmentStorageId) {
                    attachmentUrl = await ctx.storage.getUrl(record.attachmentStorageId);
                }
                return {
                    ...record,
                    changedByName: user?.name ?? "Unknown",
                    attachmentUrl,
                };
            })
        );

        return enriched;
    },
});

/**
 * Returns the most recent status history entry for a manuscript.
 */
export const getLatestBySubmission = query({
    args: { submissionId: v.id("submissions") },
    handler: async (ctx, args) => {
        const records = await ctx.db
            .query("manuscript_status_history")
            .withIndex("by_manuscript", (q) =>
                q.eq("manuscriptId", args.submissionId)
            )
            .collect();

        if (records.length === 0) return null;

        // Get the most recent one
        records.sort((a, b) => b.createdAt - a.createdAt);
        const latest = records[0];

        const user = await ctx.db.get(latest.changedByUserId);
        return {
            ...latest,
            changedByName: user?.name ?? "Unknown",
        };
    },
});
