import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Roles } from "./enums/user.enum";

const ROLE_ROUTES: Record<Roles, RegExp[]> = {
  [Roles.SYSTEM_ADMIN]: [/^\/admin/],
  [Roles.IMAGING_TECHNICIAN]: [/^\/imaging-technicians/],
  [Roles.RECEPTION_STAFF]: [/^\/reception/],
  [Roles.PHYSICIAN]: [/^\/physicians/],
  [Roles.RADIOLOGIST]: [/^\/radiologists/],
};

function getAllowedRolesForPath(path: string): Roles[] {
  return Object.entries(ROLE_ROUTES)
    .filter(([_, regexList]) => regexList.some((r) => r.test(path)))
    .map(([role]) => role as Roles);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const allowedRoles = getAllowedRolesForPath(pathname);

  if (allowedRoles.length === 0) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const [, payloadBase64] = token.split(".");
    const decoded = JSON.parse(Buffer.from(payloadBase64, "base64").toString());

    const role = decoded?.role;
    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/imaging-technicians/:path*",
    "/reception/:path*",
    "/physicians/:path*",
  ],
  runtime: "nodejs",
};
