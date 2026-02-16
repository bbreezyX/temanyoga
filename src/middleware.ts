import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (req.auth.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/admin/:path*"],
};
