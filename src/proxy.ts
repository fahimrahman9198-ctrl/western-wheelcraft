import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedAdminRoute = createRouteMatcher(['/admin((?!/login|/unauthorized).*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedAdminRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
