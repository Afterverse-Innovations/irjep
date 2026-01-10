import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { createContext, useContext } from "react";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL || "https://mock-url.convex.cloud");

// Context to track if ClerkProvider is already present
const ClerkProviderContext = createContext(false);

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    const hasClerkProvider = useContext(ClerkProviderContext);

    if (hasClerkProvider) {
        // If ClerkProvider already exists, just provide Convex
        return (
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        );
    }

    // If no ClerkProvider exists, provide both
    return (
        <ClerkProvider publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <ClerkProviderContext.Provider value={true}>
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    {children}
                </ConvexProviderWithClerk>
            </ClerkProviderContext.Provider>
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
