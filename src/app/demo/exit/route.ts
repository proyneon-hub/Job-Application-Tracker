import { NextResponse, type NextRequest } from "next/server";

import { DEMO_COOKIE } from "@/lib/demo/mode";

/** Leaves demo mode and returns to the landing page. The browser clears the demo data itself. */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
