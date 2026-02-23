import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireEditorRole } from "./lib/roleGuard";

// ─── Queries ──────────────────────────────────────────────────

/** List all templates (admin/editor only) */
export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireEditorRole(ctx);
        return await ctx.db.query("templates").order("desc").collect();
    },
});

/** List only active templates */
export const listActive = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireEditorRole(ctx);
        return await ctx.db
            .query("templates")
            .withIndex("by_active", (q: any) => q.eq("isActive", true))
            .order("desc")
            .collect();
    },
});

/** Get a single template by ID */
export const getById = query({
    args: { id: v.id("templates") },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        return await ctx.db.get(args.id);
    },
});

// ─── Mutations ────────────────────────────────────────────────

/** Create a new template */
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        version: v.string(),
        config: v.any(),
    },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        const now = Date.now();

        return await ctx.db.insert("templates", {
            name: args.name,
            description: args.description,
            version: args.version,
            createdBy: user._id,
            createdAt: now,
            updatedAt: now,
            config: args.config,
            isActive: true,
        });
    },
});

/** Update an existing template's config and metadata */
export const update = mutation({
    args: {
        id: v.id("templates"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        version: v.optional(v.string()),
        config: v.optional(v.any()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Template not found");

        const updates: any = { updatedAt: Date.now() };
        if (args.name !== undefined) updates.name = args.name;
        if (args.description !== undefined) updates.description = args.description;
        if (args.version !== undefined) updates.version = args.version;
        if (args.config !== undefined) updates.config = args.config;
        if (args.isActive !== undefined) updates.isActive = args.isActive;

        await ctx.db.patch(args.id, updates);
        return args.id;
    },
});

/** Clone a template with a new name and version */
export const clone = mutation({
    args: {
        sourceId: v.id("templates"),
        name: v.string(),
        version: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        const source = await ctx.db.get(args.sourceId);
        if (!source) throw new Error("Source template not found");

        const now = Date.now();
        return await ctx.db.insert("templates", {
            name: args.name,
            description: source.description,
            version: args.version,
            createdBy: user._id,
            createdAt: now,
            updatedAt: now,
            config: source.config,
            isActive: true,
        });
    },
});

/** Soft-delete a template (sets isActive = false) */
export const remove = mutation({
    args: { id: v.id("templates") },
    handler: async (ctx, args) => {
        const user = await requireEditorRole(ctx);
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Template not found");

        await ctx.db.patch(args.id, {
            isActive: false,
            updatedAt: Date.now(),
        });
        return args.id;
    },
});
