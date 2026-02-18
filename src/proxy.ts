import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Renamed from middleware to proxy for Next.js 16
export const proxy = auth((req) => {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (req.auth.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/api/admin/:path*"],
};
