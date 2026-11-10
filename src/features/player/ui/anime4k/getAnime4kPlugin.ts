import type Artplayer from 'artplayer';
import type { Anime4kPlugin } from 'artplayer-plugin-anime4k';
import { PLUGIN_NAME } from 'artplayer-plugin-anime4k';

export function getAnime4kPlugin(art: Artplayer): Anime4kPlugin | null {
  const plugins = art.plugins as unknown as Record<string, Anime4kPlugin | undefined>;
  return plugins[PLUGIN_NAME] ?? plugins.artplayerPluginAnime4k ?? null;
}
