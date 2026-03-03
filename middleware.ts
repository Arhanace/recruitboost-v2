import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const publicPaths = ["/login", "/signup", "/privacy-policy"];

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow auth and debug API routes
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/debug")) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isAuthenticated = !!req.auth;
  const isPublicPath =
    pathname === "/" || publicPaths.some((path) => pathname.startsWith(path));

  // Redirect authenticated users away from login/signup/splash
  if (isAuthenticated && isPublicPath) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
    );
  }

  // Redirect unauthenticated users to login (except public paths)
  if (!isAuthenticated && !isPublicPath) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/login", req.nextUrl.origin))
    );
  }

  return addSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
