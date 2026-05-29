import type { z } from 'zod';
import { getCrysolineApiKey } from '@/server/crysoline/config';
import {
  CatalogRequestBodySchema,
  catalogHintsFromBody,
  type CatalogRequestBody,
} from '@/server/catalog/catalogRequestSchema';
import { buildCatalogSearchTermsFromFields } from '@/lib/catalog/catalog-hints';
import type { CatalogHints } from '@/lib/catalog/catalog-hints';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export type CatalogRouteFailure = {
  success: false;
  error: string;
  reason?: string;
};

export type CatalogRouteSuccess = {
  success: true;
} & Record<string, unknown>;

export type CatalogRoutePayload = CatalogRouteSuccess | CatalogRouteFailure;

export interface CatalogRouteContext {
  body: CatalogRequestBody;
  hints: CatalogHints;
  baseTerms: string[];
}

export interface CreateCatalogRouteConfig<TBody extends CatalogRequestBody> {
  bodySchema?: z.ZodType<TBody>;
  requireCrysolineApiKey?: boolean;
  requireSearchTerms?: boolean;
  emptySearchTermsError?: string;
  dedupeInflight?: boolean;
  handler: (ctx: CatalogRouteContext & { body: TBody }) => Promise<CatalogRoutePayload>;
  mapHttpStatus: (payload: CatalogRoutePayload) => number;
  mapCaughtError?: (err: unknown) => CatalogRouteFailure;
}

const inflightCatalogByAnilistId = new Map<string, Promise<CatalogRoutePayload>>();

function jsonResponse(payload: CatalogRoutePayload, status: number): Response {
  return Response.json(payload, { status, headers: NO_STORE });
}

export function createCatalogRoute<TBody extends CatalogRequestBody = CatalogRequestBody>(
  config: CreateCatalogRouteConfig<TBody>
): (req: Request) => Promise<Response> {
  const schema = (config.bodySchema ?? CatalogRequestBodySchema) as z.ZodType<TBody>;

  return async function POST(req: Request): Promise<Response> {
    if (config.requireCrysolineApiKey) {
      try {
        getCrysolineApiKey();
      } catch {
        return jsonResponse(
          { success: false, error: 'crysoline_api_key_missing' },
          503
        );
      }
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return jsonResponse({ success: false, error: 'invalid_json' }, 400);
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return jsonResponse({ success: false, error: 'invalid_body' }, 400);
    }

    const body = parsed.data;
    const hints = catalogHintsFromBody(body);
    const baseTerms = buildCatalogSearchTermsFromFields({
      title: body.title,
      romaji_title: body.romaji_title,
      japanese_title: body.japanese_title,
      synonyms: body.synonyms,
    });

    if (config.requireSearchTerms && !baseTerms.length) {
      return jsonResponse(
        {
          success: false,
          error: config.emptySearchTermsError ?? 'catalog_no_search_terms',
        },
        400
      );
    }

    const ctx: CatalogRouteContext & { body: TBody } = { body, hints, baseTerms };

    const run = (): Promise<CatalogRoutePayload> => config.handler(ctx);

    if (config.dedupeInflight) {
      const anilistKey = body.anilistId.trim();
      const existing = inflightCatalogByAnilistId.get(anilistKey);
      if (existing) {
        const shared = await existing;
        return jsonResponse(shared, config.mapHttpStatus(shared));
      }

      const promise = run().finally(() => {
        if (inflightCatalogByAnilistId.get(anilistKey) === promise) {
          inflightCatalogByAnilistId.delete(anilistKey);
        }
      });
      inflightCatalogByAnilistId.set(anilistKey, promise);
      const result = await promise;
      return jsonResponse(result, config.mapHttpStatus(result));
    }

    try {
      const result = await run();
      return jsonResponse(result, config.mapHttpStatus(result));
    } catch (e) {
      const failure = config.mapCaughtError?.(e) ?? {
        success: false as const,
        error: e instanceof Error ? e.message : 'catalog_failed',
      };
      return jsonResponse(failure, config.mapHttpStatus(failure));
    }
  };
}
