import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/astro/react";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL || "https://mock-url.convex.cloud");

export default function ConvexClientProvider({
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

export function withConvex(Component: React.ComponentType<any>) {
    return function WrappedComponent(props: any) {
        return (
            <ConvexClientProvider>
                <Component {...props} />
            </ConvexClientProvider>
        );
    };
}
