import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
  matcher: [
    // Protect all routes except /auth/login, /auth/register, and api routes
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-192x192.png|icon-512x512.png|auth/login|auth/register).*)",
  ],
};
