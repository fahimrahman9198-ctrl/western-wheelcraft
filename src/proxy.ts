import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedAdminRoute = createRouteMatcher(['/admin((?!/login|/unauthorized).*)']);
const isProtectedAdminApiRoute = createRouteMatcher(['/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedAdminRoute(request) || isProtectedAdminApiRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
