import { NextResponse } from "next/server";

const WILAYAH_BASE = "https://wilayah.id/api";

/** Wilayah.id data changes rarely — cache at CDN + Next.js data cache. */
export const revalidate = 86400;

const CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  let url: string;

  switch (type) {
    case "provinces":
      url = `${WILAYAH_BASE}/provinces.json`;
      break;
    case "regencies":
      if (!code) {
        return NextResponse.json(
          { error: "Province code is required" },
          { status: 400 },
        );
      }
      url = `${WILAYAH_BASE}/regencies/${code}.json`;
      break;
    case "districts":
      if (!code) {
        return NextResponse.json(
          { error: "Regency code is required" },
          { status: 400 },
        );
      }
      url = `${WILAYAH_BASE}/districts/${code}.json`;
      break;
    case "villages":
      if (!code) {
        return NextResponse.json(
          { error: "District code is required" },
          { status: 400 },
        );
      }
      url = `${WILAYAH_BASE}/villages/${code}.json`;
      break;
    default:
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Temanyoga/1.0",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from wilayah.id" },
        { status: res.status },
      );
    }

    const data = await res.json();

    return NextResponse.json(data, { headers: { "Cache-Control": CACHE_CONTROL } });
  } catch (error) {
    console.error("Wilayah API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wilayah data" },
      { status: 500 },
    );
  }
}
