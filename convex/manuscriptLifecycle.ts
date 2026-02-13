import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// ─── Status Types ───────────────────────────────────────────────────
export const MANUSCRIPT_STATUSES = [
    "submitted",
    "pending_for_review",
    "under_peer_review",
    "requested_for_correction",
    "correction_submitted",
    "accepted",
    "rejected",
    "pre_publication",
    "published",
    "unpublished",
] as const;

export type ManuscriptStatus = (typeof MANUSCRIPT_STATUSES)[number];

// Human-readable labels
export const STATUS_LABELS: Record<ManuscriptStatus, string> = {
    submitted: "Submitted",
    pending_for_review: "Pending for Review",
    under_peer_review: "Under Peer Review",
    requested_for_correction: "Requested for Correction",
    correction_submitted: "Correction Submitted",
    accepted: "Accepted",
    rejected: "Rejected",
    pre_publication: "Pre-Publication",
    published: "Published",
    unpublished: "Unpublished",
};

// ─── Transition Map ─────────────────────────────────────────────────
// Defines which statuses can legally transition to which other statuses.
const VALID_TRANSITIONS: Record<ManuscriptStatus, ManuscriptStatus[]> = {
    submitted: ["pending_for_review"],
    pending_for_review: ["under_peer_review", "rejected"],
    under_peer_review: ["requested_for_correction", "accepted", "rejected"],
    requested_for_correction: ["correction_submitted"],
    correction_submitted: ["under_peer_review", "accepted", "rejected"],
    accepted: ["pre_publication"],
    rejected: [], // Terminal state
    pre_publication: ["published"],
    published: ["unpublished"],
    unpublished: ["pre_publication"],
};

// ─── Role Permissions ───────────────────────────────────────────────
// Which target statuses each role is allowed to set.
type ChangeRole = "editor" | "author" | "system";

const ROLE_ALLOWED_TARGETS: Record<ChangeRole, ManuscriptStatus[]> = {
    system: ["submitted", "pending_for_review"],
    editor: [
        "pending_for_review",
        "under_peer_review",
        "requested_for_correction",
        "accepted",
        "rejected",
        "pre_publication",
        "published",
        "unpublished",
    ],
    author: ["correction_submitted"],
};

// ─── Helpers ────────────────────────────────────────────────────────

function isValidTransition(
    from: ManuscriptStatus,
    to: ManuscriptStatus
): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function canRoleSetStatus(role: ChangeRole, target: ManuscriptStatus): boolean {
    return ROLE_ALLOWED_TARGETS[role]?.includes(target) ?? false;
}

function getEffectiveRole(
    userRole: string
): ChangeRole {
    if (userRole === "admin" || userRole === "editor") return "editor";
    if (userRole === "author") return "author";
    return "author"; // default fallback
}

// ─── Queries ────────────────────────────────────────────────────────

/**
 * Returns the list of statuses the current user can transition a specific
 * submission to, based on the submission's current status and the user's role.
 */
export const getAvailableTransitions = query({
    args: { submissionId: v.id("submissions") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return [];

        const submission = await ctx.db.get(args.submissionId);
        if (!submission) return [];

        const currentStatus = submission.status as ManuscriptStatus;
        const effectiveRole = getEffectiveRole(user.role);
        const possibleTransitions = VALID_TRANSITIONS[currentStatus] || [];

        return possibleTransitions.filter((target) =>
            canRoleSetStatus(effectiveRole, target)
        );
    },
});

// ─── Mutations ──────────────────────────────────────────────────────

/**
 * Core lifecycle mutation. Changes the status of a manuscript with full
 * validation, permission checks, and audit history recording.
 */
export const changeStatus = mutation({
    args: {
        submissionId: v.id("submissions"),
        newStatus: v.string(),
        note: v.string(),
        attachmentStorageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Auth check
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthorized: You must be signed in.");

        // 2. Fetch submission
        const submission = await ctx.db.get(args.submissionId);
        if (!submission) throw new Error("Submission not found.");

        const currentStatus = submission.status as ManuscriptStatus;
        const newStatus = args.newStatus as ManuscriptStatus;

        // 3. Validate status is a known status
        if (!MANUSCRIPT_STATUSES.includes(newStatus)) {
            throw new Error(`Invalid status: "${args.newStatus}"`);
        }

        // 4. Validate legal transition
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new Error(
                `Invalid transition: Cannot move from "${currentStatus}" to "${newStatus}".`
            );
        }

        // 5. Validate role permission
        const effectiveRole = getEffectiveRole(user.role);
        if (!canRoleSetStatus(effectiveRole, newStatus)) {
            throw new Error(
                `Permission denied: Role "${user.role}" cannot set status to "${newStatus}".`
            );
        }

        // 6. Extra author guard: author can only submit correction when status is requested_for_correction
        if (
            effectiveRole === "author" &&
            newStatus === "correction_submitted" &&
            currentStatus !== "requested_for_correction"
        ) {
            throw new Error(
                "You can only submit a correction when the status is 'Requested for Correction'."
            );
        }

        // 7. Validate note is not empty
        if (!args.note || args.note.trim().length === 0) {
            throw new Error("A note is required for every status change.");
        }

        // 8. Insert history record
        await ctx.db.insert("manuscript_status_history", {
            manuscriptId: args.submissionId,
            previousStatus: currentStatus,
            newStatus: newStatus,
            changedByUserId: user._id,
            changedByRole: effectiveRole,
            note: args.note.trim(),
            attachmentStorageId: args.attachmentStorageId,
            createdAt: Date.now(),
        });

        // 9. Update submission status
        await ctx.db.patch(args.submissionId, {
            status: newStatus as any,
            updatedAt: Date.now(),
        });

        return { success: true, newStatus };
    },
});
