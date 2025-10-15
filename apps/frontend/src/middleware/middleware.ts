// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Roles } from "@/enums/user.enum";
import api from "@/lib/axios";

const ROLE_ROUTES: Record<string, string[]> = {
  [Roles.SYSTEM_ADMIN]: [/^\/system-admin/, /^\/admin/],
  [Roles.IMAGING_TECHNICIAN]: [/^\/imaging-technicians/],
  [Roles.RECEPTION_STAFF]: [/^\/reception/],
  [Roles.PHYSICIAN]: [/^\/physicians/],
};

function findExpectedRolesForPath(path: string): string[] {
  const roles: string[] = [];
  for (const [role, prefixes] of Object.entries(ROLE_ROUTES)) {
    for (const p of prefixes) {
      if (
        path === p ||
        path.startsWith(p + "/") ||
        path.startsWith(p + ":") ||
        path.startsWith(p)
      ) {
        roles.push(role);
        break;
      }
    }
  }
  return roles;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Nếu path không phải route cần bảo vệ -> cho qua luôn
  const expectedRoles = findExpectedRolesForPath(path);
  if (expectedRoles.length === 0) return NextResponse.next();

  // 1) Kiểm tra token tồn tại
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    console.log("Token not found in middleware");
    // Nếu là request tới trang (frontend) -> redirect về login
    // Nếu muốn API trả 401: detect bằng prefix /api và trả response JSON 401
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2) Verify token và check role
  try {
    //dùng backend verify => không cần set secret ở frontend
    let decoded: any = await api.get("/user/me");
    decoded = decoded.data.data;

    // Nếu token hợp lệ nhưng không có role -> redirect login
    if (!decoded || !decoded.role) {
      console.log("!decoded hoac decoded k co role");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Nếu route cần role cụ thể mà role trong token không nằm trong expectedRoles -> 403
    if (!expectedRoles.includes(decoded.role)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    // Ok: token hợp lệ và role đúng -> cho qua
    return NextResponse.next();
  } catch (err: any) {
    // Nếu token expired, bạn có thể redirect login với query để show message
    if (err.name === "TokenExpiredError") {
      console.log("Token expired");
      return NextResponse.redirect(new URL("/login?expired=1", req.url));
    }
    // Các lỗi verify khác -> redirect login
    console.log("OTher error");
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/system-admin/:path*",
    "/imaging-technicians/:path*",
    "/physicians/:path*",
    "/reception/:path*",
  ],
};
