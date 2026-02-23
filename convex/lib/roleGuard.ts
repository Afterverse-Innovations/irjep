import { getCurrentUser } from "../users";

/**
 * Enforces admin/editor role for template and paper operations.
 * Throws if user is not authenticated or lacks required role.
 */
export async function requireEditorRole(ctx: any) {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized: not authenticated");
    if (user.role !== "admin" && user.role !== "editor") {
        throw new Error("Unauthorized: requires admin or editor role");
    }
    return user;
}
