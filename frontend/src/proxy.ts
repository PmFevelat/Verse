import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "__verve_session";

// Routes qui nécessitent d'être connecté
const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/account"];

// Routes réservées aux utilisateurs non connectés
const AUTH_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = Boolean(session);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Utilisateur non connecté qui tente d'accéder à une route protégée
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Utilisateur connecté qui tente d'accéder à une page d'auth
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Appliqué à toutes les routes sauf :
     * - les fichiers statiques (_next/static, _next/image, favicon.ico, etc.)
     * - les API routes
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
};
