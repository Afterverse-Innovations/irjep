import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("author")),
    bio: v.optional(v.string()),
    institution: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  submissions: defineTable({
    title: v.string(),
    abstract: v.string(),
    articleType: v.string(),
    authorId: v.id("users"),
    correspondingAuthor: v.object({
      name: v.string(),
      address: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    researchAuthors: v.array(
      v.object({
        name: v.string(),
        affiliation: v.string(),
      })
    ),
    keywords: v.array(v.string()),
    copyrightFileId: v.string(), // Convex storage ID
    manuscriptFileId: v.string(), // Convex storage ID
    status: v.union(
      v.literal("submitted"),
      v.literal("pending_for_review"),
      v.literal("under_peer_review"),
      v.literal("requested_for_correction"),
      v.literal("correction_submitted"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("pre_publication"),
      v.literal("published"),
      v.literal("unpublished")
    ),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    submissionId: v.id("submissions"),
    reviewerId: v.id("users"), // Must be editor
    comments: v.string(),
    verdict: v.union(v.literal("approve"), v.literal("reject"), v.literal("changes_requested")),
    createdAt: v.number(),
  }).index("by_submission", ["submissionId"]),

  issues: defineTable({
    title: v.string(), // e.g., "Volume 1, Issue 2"
    volume: v.number(),
    issueNumber: v.number(),
    publicationDate: v.string(), // ISO date or "April-June 2026"
    isPublished: v.boolean(),
  }).index("by_published", ["isPublished"]),

  articles: defineTable({
    submissionId: v.id("submissions"),
    issueId: v.id("issues"),
    title: v.string(),
    authors: v.array(v.string()), // Denormalized for easy access
    pageRange: v.optional(v.string()),
    doi: v.optional(v.string()),
    publishDate: v.number(),
    slug: v.string(), // for URL
    views: v.optional(v.number()),
    downloads: v.optional(v.number()),
  })
    .index("by_issue", ["issueId"])
    .index("by_slug", ["slug"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["issueId"],
    }),

  manuscript_status_history: defineTable({
    manuscriptId: v.id("submissions"),
    previousStatus: v.optional(v.string()),
    newStatus: v.string(),
    changedByUserId: v.id("users"),
    changedByRole: v.union(
      v.literal("editor"),
      v.literal("author"),
      v.literal("system")
    ),
    note: v.string(),
    attachmentStorageId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_manuscript", ["manuscriptId"])
    .index("by_changed_by", ["changedByUserId"]),

  // ─── Template Builder ───────────────────────────────────────
  // Stores journal template configurations (page layout, typography, etc.)
  templates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Full template config stored as JSON — see template-config.ts for types
    config: v.any(),
    isActive: v.boolean(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_active", ["isActive"]),

  // ─── Rendered Papers ────────────────────────────────────────
  // Stores the generated typeset paper data (template config + submission content)
  papers: defineTable({
    submissionId: v.id("submissions"),
    templateId: v.id("templates"),
    // Structured paper data stored as JSON — see paper-data.ts for types
    renderedData: v.any(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    status: v.union(v.literal("draft"), v.literal("final")),
  })
    .index("by_submission", ["submissionId"])
    .index("by_template", ["templateId"])
    .index("by_creator", ["createdBy"])
    .index("by_status", ["status"]),
});
