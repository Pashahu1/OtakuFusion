import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { ApiError } from '@/lib/errors/ApiError';
import type { JsonReadResult } from '@/shared/types/JsonReadResult';

export async function readJsonBody(req: Request): Promise<JsonReadResult> {
  try {
    const data: unknown = await req.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { message: 'Invalid JSON body.' },
        { status: 400 }
      ),
    };
  }
}

export function parseWithSchema<S extends z.ZodTypeAny>(
  schema: S,
  body: unknown
): { ok: true; data: z.infer<S> } | { ok: false; response: NextResponse } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          message: 'Validation failed.',
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }
  return { ok: true, data: result.data };
}

export function jsonMessage(
  message: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(extra ? { message, ...extra } : { message }, {
    status,
  });
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return jsonMessage(message, 401);
}

export function internalServerErrorResponse(): NextResponse {
  return jsonMessage('Internal server error.', 500);
}

export function handleRouteError(
  err: unknown,
  logLabel?: string
): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        message: err.message,
        ...(err.details != null ? { details: err.details } : {}),
      },
      { status: err.status }
    );
  }
  if (logLabel) console.error(logLabel, err);
  else console.error(err);
  return internalServerErrorResponse();
}
