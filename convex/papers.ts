import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireEditorRole } from "./lib/roleGuard";

// ─── Queries ──────────────────────────────────────────────────

/** List all papers (admin/editor only), enriched with submission title */
export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireEditorRole(ctx);
        const papers = await ctx.db.query("papers").order("desc").collect();

        return await Promise.all(
            papers.map(async (paper) => {
                const submission = await ctx.db.get(paper.submissionId);
                const template = await ctx.db.get(paper.templateId);
                return {
                    ...paper,
                    submissionTitle: submission?.title ?? "Unknown",
                    templateName: template?.name ?? "Unknown",
                };
            })
        );
    },
});

/** Get papers for a specific submission */
export const listBySubmission = query({
    args: { submissionId: v.id("submissions") },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        return await ctx.db
            .query("papers")
            .withIndex("by_submission", (q: any) =>
                q.eq("submissionId", args.submissionId)
            )
            .collect();
    },
});

/** Get a single paper by ID, enriched with template config and submission data */
export const getById = query({
    args: { id: v.id("papers") },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        const paper = await ctx.db.get(args.id);
        if (!paper) return null;

        const template = await ctx.db.get(paper.templateId);
        const submission = await ctx.db.get(paper.submissionId);

        return {
            ...paper,
            templateConfig: template?.config ?? null,
            templateName: template?.name ?? "Unknown",
            submissionTitle: submission?.title ?? "Unknown",
        };
    },
});

// ─── Mutations ────────────────────────────────────────────────

/** Generate a new paper from a submission + template */
export const generate = mutation({
    args: {
        submissionId: v.id("submissions"),
        templateId: v.id("templates"),
        renderedData: v.any(),
    },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);

        // Verify submission and template exist
        const submission = await ctx.db.get(args.submissionId);
        if (!submission) throw new Error("Submission not found");

        const template = await ctx.db.get(args.templateId);
        if (!template) throw new Error("Template not found");

        const now = Date.now();
        return await ctx.db.insert("papers", {
            submissionId: args.submissionId,
            templateId: args.templateId,
            renderedData: args.renderedData,
            createdBy: user._id,
            createdAt: now,
            updatedAt: now,
            status: "draft",
        });
    },
});

/** Update rendered data of a paper */
export const update = mutation({
    args: {
        id: v.id("papers"),
        renderedData: v.any(),
    },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Paper not found");

        await ctx.db.patch(args.id, {
            renderedData: args.renderedData,
            updatedAt: Date.now(),
        });
        return args.id;
    },
});

/** Update paper status (draft → final) */
export const updateStatus = mutation({
    args: {
        id: v.id("papers"),
        status: v.union(v.literal("draft"), v.literal("final")),
    },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Paper not found");

        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: Date.now(),
        });
        return args.id;
    },
});
