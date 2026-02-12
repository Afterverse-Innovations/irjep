import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/astro/react";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL || "https://mock-url.convex.cloud");

import { UserSync } from "./auth/UserSync";

// Convex provider that uses Astro's Clerk integration
export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <UserSync />
            {children}
        </ConvexProviderWithClerk>
    );
}

// HOC that provides Convex (relies on Astro's Clerk integration)
export function withConvex(Component: React.ComponentType<any>) {
    return function WrappedComponent(props: any) {
        return (
            <ConvexClientProvider>
                <Component {...props} />
            </ConvexClientProvider>
        );
    };
}
