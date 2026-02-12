"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/astro/react";
import { useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";

export function UserSync() {
    const { isSignedIn } = useAuth();
    const syncUser = useMutation(api.users.syncUser);

    useEffect(() => {
        if (isSignedIn) {
            syncUser({}).catch((err) => {
                console.error("Failed to sync user to Convex:", err);
            });
        }
    }, [isSignedIn, syncUser]);

    return null;
}
