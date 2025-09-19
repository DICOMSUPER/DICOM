
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (req.nextUrl.pathname.startsWith("/system-admin") && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/403", req.url)); 
    }

 
    if (req.nextUrl.pathname.startsWith("/imaging-technicians)") && decoded.role !== "imaging-technicians)") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/reception") && decoded.role !== "reception") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/physicians") && decoded.role !== "physicians") {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/system-admin/:path*", "/imaging-technicians/:path*", "/physicians/:path*", "/reception/:path*"],
};
