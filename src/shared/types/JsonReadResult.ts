import type { NextResponse } from "next/server";

export type JsonReadResult =
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse };
