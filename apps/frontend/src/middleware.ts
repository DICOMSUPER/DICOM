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

// ====================== MIDDLEWARE ======================
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const allowedRoles = getAllowedRolesForPath(pathname);
  if (allowedRoles.length === 0) return NextResponse.next();

  const token = req.cookies.get("accessToken")?.value;

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
    "/admin/:path*",
    "/imaging-technicians/:path*",
    "/radiologist/:path*",
    "/reception/:path*",
    "/physicians/:path*",
  ],
  runtime: "nodejs",
};
