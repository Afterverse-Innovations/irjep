import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL || "https://mock-url.convex.cloud");

// Combined provider with both Clerk and Convex
export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ClerkProvider publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}

// Convex-only provider (for use when Clerk is already provided)
export function ConvexOnlyProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}

// HOC that provides both Clerk and Convex (for standalone components)
export function withConvex(Component: React.ComponentType<any>) {
    return function WrappedComponent(props: any) {
        return (
            <ConvexClientProvider>
                <Component {...props} />
            </ConvexClientProvider>
        );
    };
}

// HOC that only provides Convex (for components inside layouts with Clerk)
export function withConvexOnly(Component: React.ComponentType<any>) {
    return function WrappedComponent(props: any) {
        return (
            <ConvexOnlyProvider>
                <Component {...props} />
            </ConvexOnlyProvider>
        );
    };
}
