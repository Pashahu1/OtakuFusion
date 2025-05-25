"use client";

import React, { useEffect, useRef, useState } from "react";
import { EpisodesList } from "../VideoPlayer/EpisodesList/EpisodesList";
import { EpisodeServer } from "../VideoPlayer/EpisodeServer/EpisodeServer";
import Player from "../VideoPlayer/Player/Player";
import Hls from "hls.js";
import { getEpisodesServer } from "@/services/getEpisodesServer";
import { getVideoSources } from "@/services/getVideoSources";
import { AnimeServerType } from "@/types/AnimeServer";
import { EpisodesType } from "@/types/EpisodesListType";

type Props = {
  episodes: EpisodesType[];
  totalEpisodes: number;
};

export const VideoPlayer: React.FC<Props> = ({ episodes, totalEpisodes }) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState("");
  const [category, setCategory] = useState<"sub" | "dub">("dub");
  const [server, setServer] = useState("hd-2");
  const [servers, setServers] = useState<AnimeServerType | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (episodes.length > 0 && !selectedEpisodeId) {
      setSelectedEpisodeId(episodes[0].episodeId);
    }
  }, [episodes]);

  useEffect(() => {
    const loadVideoData = async () => {
      if (!selectedEpisodeId) return;

      try {
        const serverRes = await getEpisodesServer(selectedEpisodeId);
        setServers(serverRes.data);

        const rawUrl = await getVideoSources(
          selectedEpisodeId,
          server,
          category
        );
        const firstSource = rawUrl?.sources?.[0];

        if (firstSource?.url) {
          const proxy =
            "https://gogoanime-and-hianime-proxy.vercel.app/m3u8-proxy?url=";
          const finalUrl = proxy + encodeURIComponent(firstSource.url);
          setVideoUrl(finalUrl);
        } else {
          setVideoUrl(null);
        }
      } catch (err) {
        console.error("Video load error:", err);
      }
    };

    loadVideoData();
  }, [selectedEpisodeId, server, category]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (videoUrl && videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);
    }
  }, [videoUrl]);

  return (
    <div className="video-player">
      <div className="video-player__content">
        <Player videoRef={videoRef} selected={selectedEpisodeId} />
        <EpisodeServer
          servers={servers}
          selectedServer={{ type: category, serverName: server }}
          onServerSelect={({ type, serverName }) => {
            setCategory(type);
            setServer(serverName);
          }}
        />
      </div>
      <EpisodesList
        episodes={episodes}
        totalEpisodes={totalEpisodes}
        selected={selectedEpisodeId}
        onSelected={setSelectedEpisodeId}
      />
    </div>
  );
};
