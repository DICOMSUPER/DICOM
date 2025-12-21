import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Roles } from "@/common/enums/user.enum";

// ====================== ROLE MAPPING ======================
const ROLE_ROUTES: Record<Roles, RegExp[]> = {
  [Roles.SYSTEM_ADMIN]: [/^\/admin/, /^\/profile/],
  [Roles.IMAGING_TECHNICIAN]: [/^\/imaging-technician/, /^\/viewer/, /^\/profile/],
  [Roles.RADIOLOGIST]: [/^\/radiologist/, /^\/viewer/, /^\/profile/],
  [Roles.RECEPTION_STAFF]: [/^\/reception/, /^\/profile/],
  [Roles.PHYSICIAN]: [/^\/physician/, /^\/viewer/, /^\/profile/],
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
      return "/admin/dashboard";
    case Roles.IMAGING_TECHNICIAN:
      return "/imaging-technician/dashboard";
    case Roles.RECEPTION_STAFF:
      return "/reception/dashboard";
    case Roles.PHYSICIAN:
      return "/physician/dashboard";
    case Roles.RADIOLOGIST:
      return "/radiologist/dashboard";
    default:
      return "/dashboard";
  }
}

// ====================== MIDDLEWARE ======================
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;
  console.log("Token:", token);
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
      const dashboardUrl = getDashboardByRole(decoded.role);
      console.log("⚠️ Unauthorized access attempt, redirecting to user's dashboard:", dashboardUrl);
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
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
    "/login",
    "/admin/:path*",
    "/imaging-technician/:path*",
    "/radiologist/:path*",
    "/reception/:path*",
    "/physician/:path*",
    "/viewer/:path*",
    "/profile/:path*",
  ],
  runtime: "nodejs",
};
