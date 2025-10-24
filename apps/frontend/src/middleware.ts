import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Roles } from "@/enums/user.enum";

// ====================== ROLE MAPPING ======================
const ROLE_ROUTES: Record<Roles, RegExp[]> = {
  [Roles.SYSTEM_ADMIN]: [/^\/admin/],
  [Roles.IMAGING_TECHNICIAN]: [/^\/imaging-technicians/],
  [Roles.RADIOLOGIST]: [/^\/radiologist/],
  [Roles.RECEPTION_STAFF]: [/^\/reception/],
  [Roles.PHYSICIAN]: [/^\/physicians/],
};

// ====================== FIND ALLOWED ROLES ======================
function getAllowedRolesForPath(path: string): Roles[] {
  return Object.entries(ROLE_ROUTES)
    .filter(([_, regexList]) => regexList.some((r) => r.test(path)))
    .map(([role]) => role as Roles);
}

// ====================== HELPER: GET DASHBOARD BY ROLE ======================
function getDashboardByRole(role: Roles): string {
  switch (role) {
    case Roles.SYSTEM_ADMIN:
      return "/admin";
    case Roles.IMAGING_TECHNICIAN:
      return "/imaging-technicians";
    case Roles.RECEPTION_STAFF:
      return "/reception";
    case Roles.PHYSICIAN:
      return "/physicians";
    case Roles.RADIOLOGIST:
      return "/radiologist";
    default:
      return "/dashboard";
  }
}

// ====================== MIDDLEWARE ======================
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;

  // ✅ CASE 1: User trying to access /login while authenticated
  if (pathname === "/login") {
    if (token) {
      try {
        const decoded = jwt.decode(token) as { role?: Roles; exp?: number } | null;
        
        if (decoded && decoded.role) {
          // Redirect to appropriate dashboard
          const dashboardUrl = getDashboardByRole(decoded.role);
          console.log("✅ User already authenticated, redirecting from /login to:", dashboardUrl);
          return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }
      } catch (err) {
        // Invalid token, allow access to login page
        console.log("⚠️ Invalid token on /login, allowing access");
      }
    }
    // No token or invalid token, allow access to login page
    return NextResponse.next();
  }

  // ✅ CASE 2: Protected routes (role-based access)
  const allowedRoles = getAllowedRolesForPath(pathname);
  if (allowedRoles.length === 0) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwt.decode(token) as { role?: Roles; exp?: number } | null;

    if (!decoded || !decoded.role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.log("✅ Token decoded:", decoded);

   
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-role", decoded.role);

    return response;
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// ====================== CONFIG ======================
export const config = {
  matcher: [
    "/login",  // ✅ Add /login to matcher
    "/admin/:path*",
    "/imaging-technicians/:path*",
    "/radiologist/:path*",
    "/reception/:path*",
    "/physicians/:path*",
  ],
  runtime: "nodejs",
};
