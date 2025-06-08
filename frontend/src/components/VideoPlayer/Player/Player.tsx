"use client";

import { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";

export interface Track {
  file: string;
  kind: "thumbnails" | string;
  label?: string;
  srclang?: string;
  default?: boolean;
}

export interface Segment {
  start: number;
  end: number;
}

export interface Source {
  url: string;
  type: "hls" | "mp4" | string;
  quality?: string;
}

export interface AnimePlayerType {
  headers: {
    Referer: string;
  };
  tracks: Track[];
  intro?: Segment;
  outro?: Segment;
  sources: Source[];
  anilistID: number;
  malID: number;
}

interface PlayerProps {
  playerData: AnimePlayerType | null;
  selected: string;
}

console.log();

export default function Player({ playerData, selected }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const source = playerData?.sources?.[0];
    if (!source?.url || !containerRef.current) return;

    const proxy =
      "https://gogoanime-and-hianime-proxy.vercel.app/m3u8-proxy?url=";
    const finalUrl = proxy + encodeURIComponent(source.url);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (artRef.current) {
      artRef.current.destroy();
      artRef.current = null;
    }

    const art = new Artplayer({
      container: containerRef.current,
      url: finalUrl,
      type: source.type,
      volume: 0.5,
      autoplay: false,
      muted: false,
      setting: true,
      fullscreen: true,
      hotkey: true,
      miniProgressBar: true,
      backdrop: true,
      playsInline: true,
      airplay: true,
      theme: "#23ade5",
      subtitle: {},
      settings: [],
      customType: {
        hls(video: HTMLVideoElement, url: string) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          }
        },
      },
      controls: [
        {
          name: "SkipOpening",
          position: "right",
          html: "⏩",
          tooltip: "Skip Opening",
          click: () => {
            if (playerData?.intro?.start) {
              art.seek = playerData?.intro?.end;
            }
            return;
          },
        },
      ],
    });
    artRef.current = art;

    return () => {
      artRef.current?.destroy();
      hlsRef.current?.destroy();
      hlsRef.current = null;
      artRef.current = null;
    };
  }, [playerData, selected]);

  return <div ref={containerRef} style={{ width: "100%", height: "700px" }} />;
}

// Auto skip intro
// if (playerData && playerData.intro?.end) {
//   const introStart = playerData.intro.start ?? 0;
//   art.on("video:timeupdate", () => {
//     if (
//       art.currentTime > introStart &&
//       art.currentTime < playerData.intro!.end
//     ) {
//       art.currentTime = playerData.intro!.end;
//     }
//   });
// }

// Pause at outro
// if (playerData && playerData.outro?.start) {
//   art.on("video:timeupdate", () => {
//     if (art.currentTime > playerData.outro!.start) {
//       art.pause();
//     }
//   });
// }

// Load subtitles
// const subtitleTracks =
//   playerData?.tracks?.filter((track) => track.kind === "subtitles") || [];
// for (const track of subtitleTracks) {
//   art.subtitle.switch(track.file, {
//     name: track.label || "Subtitle",
//     type: "vtt",
//   });
// }
