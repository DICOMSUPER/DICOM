import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Roles } from "./enums/user.enum";

const ROLE_ROUTES: Record<Roles, RegExp[]> = {
  [Roles.SYSTEM_ADMIN]: [/^\/system-admin/, /^\/admin/],
  [Roles.IMAGING_TECHNICIAN]: [/^\/imaging-technicians/],
  [Roles.RECEPTION_STAFF]: [/^\/reception/],
  [Roles.PHYSICIAN]: [/^\/physicians/],
};

function getAllowedRolesForPath(path: string): Roles[] {
  return Object.entries(ROLE_ROUTES)
    .filter(([_, regexList]) => regexList.some((r) => r.test(path)))
    .map(([role]) => role as Roles);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const allowedRoles = getAllowedRolesForPath(pathname);

  // Nếu route không yêu cầu role → cho qua
  if (allowedRoles.length === 0) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;
  console.log("🔐 Checking access_token for path:", token);
  if (!token) {
    console.warn("❌ No access_token found in cookies");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role?: Roles };
    console.log("✅ Token decoded:", decoded);
    if (!decoded.role) {
      console.warn("❌ Token has no role field");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!allowedRoles.includes(decoded.role)) {
      console.warn(`⚠️ Role ${decoded.role} not allowed for ${pathname}`);
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  } catch (err: any) {
    console.error("❌ Invalid token:", err.message);
    const redirectUrl = new URL("/login", req.url);
    if (err.name === "TokenExpiredError") redirectUrl.searchParams.set("expired", "1");
    return NextResponse.redirect(redirectUrl);
  }
}


export const config = {
  matcher: [
    "/login",
    "/system-admin/:path*",
    "/imaging-technicians/:path*",
    "/reception/:path*",
    "/physicians/:path*",
  ],
  runtime: "nodejs",
};

