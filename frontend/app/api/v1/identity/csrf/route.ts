import { type NextRequest, NextResponse } from "next/server";

// Browsers omit Origin on same-origin GET. Supply the configured public origin
// only after validating this request's host and browser context.
export async function GET(request: NextRequest) {
  const publicOrigin = process.env.IDENTITY_PUBLIC_ORIGIN ?? (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
  const apiOrigin = process.env.IDENTITY_API_ORIGIN ?? (process.env.NODE_ENV === "development" ? "http://localhost:5000" : undefined);
  if (!publicOrigin || !apiOrigin) return NextResponse.json({ code: "identity_not_configured" }, { status: 503 });
  const expected = new URL(publicOrigin).origin;
  let refererOrigin: string | undefined;
  try { refererOrigin = new URL(request.headers.get("referer") ?? "").origin; } catch { /* Reject missing context. */ }
  if (request.headers.get("host") !== new URL(expected).host ||
      request.headers.get("sec-fetch-site") !== "same-origin" || refererOrigin !== expected ||
      (request.headers.has("origin") && request.headers.get("origin") !== expected)) {
    return NextResponse.json({ code: "csrf_origin_rejected" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const upstream = await fetch(`${apiOrigin.replace(/\/$/, "")}/api/v1/identity/csrf`, {
      cache: "no-store", headers: { Origin: expected, Cookie: request.headers.get("cookie") ?? "", Accept: "application/json" },
    });
    const response = new NextResponse(await upstream.text(), { status: upstream.status,
      headers: { "Cache-Control": "no-store", "Content-Type": upstream.headers.get("content-type") ?? "application/json" } });
    for (const cookie of upstream.headers.getSetCookie()) response.headers.append("Set-Cookie", cookie);
    return response;
  } catch {
    return NextResponse.json({ code: "identity_unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
