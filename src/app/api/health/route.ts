import { NextResponse } from "next/server";

// Lightweight liveness probe for Railway's healthcheck. Deliberately does NOT
// touch the database so it stays green during preDeploy migrations / DB blips.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
