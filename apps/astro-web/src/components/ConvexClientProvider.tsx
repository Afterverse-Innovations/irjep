import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL || "https://mock-url.convex.cloud");

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

export function withConvex(Component: React.ComponentType<any>) {
    return function WrappedComponent(props: any) {
        return (
            <ConvexClientProvider>
                <Component {...props} />
            </ConvexClientProvider>
        );
    };
}
