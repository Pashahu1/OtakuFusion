"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EpisodesList } from "../VideoPlayer/EpisodesList/EpisodesList";
import { EpisodeServer } from "../VideoPlayer/EpisodeServer/EpisodeServer";
import Player from "../VideoPlayer/Player/Player";
import { getEpisodesServer } from "@/services/getEpisodesServer";
import { getVideoSources } from "@/services/getVideoSources";
import { AnimeServerType } from "@/types/AnimeServer";
import { EpisodesType } from "@/types/EpisodesListType";
import "./VideoPlayer.scss";
import { AnimePlayerType } from "@/types/AnimePLayer";
import { Loader } from "../../components/shared/Loader/Loader";
import { useRouter } from "next/navigation";
import throttle from "lodash.throttle";

type Props = {
  episodes: EpisodesType[];
  totalEpisodes: number;
};

export const VideoPlayer: React.FC<Props> = React.memo(
  ({ episodes, totalEpisodes }) => {
    const [selectedEpisodeId, setSelectedEpisodeId] = useState("");
    const [category, setCategory] = useState<"sub" | "dub">("sub");
    const [server, setServer] = useState("hd-2");
    const [servers, setServers] = useState<AnimeServerType | null>(null);
    const [playerData, setPlayerData] = useState<AnimePlayerType | null>(null);
    const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
    const router = useRouter();

    const loadVideoData = useCallback(
      async (episodeId: string, serverName: string, cat: "sub" | "dub") => {
        if (!episodeId) return;
        setIsLoadingPlayer(true);
        try {
          const [serverRes, rawUrl] = await Promise.all([
            getEpisodesServer(episodeId),
            getVideoSources(episodeId, serverName, cat),
          ]);
          setServers(serverRes.data);
          setPlayerData(rawUrl);
          setIsLoadingPlayer(false);
          router.push(
            `/watch/${episodeId}?server=${serverName}&category=${cat}`
          );
        } catch (err) {
          console.error("Error", err);
          setIsLoadingPlayer(false);
          router.push(`/watch`);
        }
      },
      [router]
    );

    const throttledLoadRef = useRef(
      throttle((episodeId: string, serverName: string, cat: "sub" | "dub") => {
        loadVideoData(episodeId, serverName, cat);
      }, 1000)
    );

    useEffect(() => {
      throttledLoadRef.current(selectedEpisodeId, server, category);
    }, [selectedEpisodeId, server, category]);

    useEffect(() => {
      if (episodes.length > 0 && !selectedEpisodeId) {
        setSelectedEpisodeId(episodes[0].episodeId);
      }
    }, [episodes, selectedEpisodeId]);

    return (
      <div className="video-player">
        <div className="video-player__content">
          <div className="video-player__player">
            {isLoadingPlayer ? (
              <Loader />
            ) : (
              <Player playerData={playerData} selected={selectedEpisodeId} />
            )}
          </div>

          <div className="video-player__info">
            <EpisodeServer
              servers={servers}
              selectedServer={{ type: category, serverName: server }}
              onServerSelect={({ type, serverName }) => {
                setCategory(type);
                setServer(serverName);
              }}
            />

            <EpisodesList
              episodes={episodes}
              totalEpisodes={totalEpisodes}
              selected={selectedEpisodeId}
              onSelected={setSelectedEpisodeId}
            />
          </div>
        </div>
      </div>
    );
  }
);
