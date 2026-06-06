import { unstable_cache } from 'next/cache';
import { ANIKOTO_STREAM_CACHE_SECONDS } from '@/server/anikoto/config';
import { anikotoStream, type AnikotoStreamParams } from '@/server/anikoto/client';
import type { AnikotoApiEnvelope, AnikotoStreamData } from '@/server/anikoto/types';

export async function getAnikotoStreamCached(
  params: AnikotoStreamParams
): Promise<AnikotoApiEnvelope<AnikotoStreamData>> {
  const id = params.id.trim();
  const ep = params.ep.trim();
  if (!id || !ep) {
    throw new Error('anikoto_stream_params_required');
  }

  return unstable_cache(
    async () => anikotoStream(params),
    ['anikoto-stream', id, ep, params.server, params.type],
    { revalidate: ANIKOTO_STREAM_CACHE_SECONDS }
  )();
}
