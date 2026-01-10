"use client";

import { ClerkProvider } from "@clerk/astro/react";
import type { ReactNode } from "react";

export function GlobalClerkProvider({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}>
            {children}
        </ClerkProvider>
    );
}