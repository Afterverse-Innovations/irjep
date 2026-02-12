"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/astro/react";
import { useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";

export function UserSync() {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const syncUser = useMutation(api.users.syncUser);

    useEffect(() => {
        if (isSignedIn && user) {
            syncUser({
                name: user.fullName || user.username || "Scholar",
                email: user.primaryEmailAddress?.emailAddress || "",
            }).catch((err) => {
                console.error("Failed to sync user to Convex:", err);
            });
        }
    }, [isSignedIn, user, syncUser]);

    return null;
}
