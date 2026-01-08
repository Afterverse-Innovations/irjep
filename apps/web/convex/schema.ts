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
    authorId: v.id("users"),
    fileId: v.optional(v.string()), // Convex storage ID
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("published")
    ),
    version: v.number(),
    keywords: v.optional(v.array(v.string())),
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
  })
    .index("by_issue", ["issueId"])
    .index("by_slug", ["slug"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["issueId"],
    }),
});
