import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isPublicRoute = createRouteMatcher(['/', '/about(.*)', '/aim-scope(.*)', '/issues(.*)', '/articles(.*)', '/author(.*)', '/editorial-board(.*)', '/author-guidelines(.*)', '/contact(.*)', '/policies(.*)', '/search(.*)']);

export const onRequest = clerkMiddleware((auth, context) => {
    const { userId, redirectToSignIn } = auth();

    if (!isPublicRoute(context.request) && !userId) {
        return redirectToSignIn();
    }
});
