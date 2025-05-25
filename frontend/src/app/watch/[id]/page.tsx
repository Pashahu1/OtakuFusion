"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getAnimeDetails } from "../../../services/getAnimeDetails";
import { AnimeDetailsType } from "../../../types/AnimeDetailsType";
import "./animeDetails.scss";

import { SwiperCard } from "@/components/SwiperCard/SwiperCard";
import { Loader } from "@/components/shared/Loader/Loader";
import { MoreInfo } from "@/components/MoreInfo/MoreInfo";
import { Seasons } from "@/components/Seasons/Seasons";
import { Info } from "@/components/Info/Info";
import { getAnimeEpisodes } from "@/services/getAnimeEpisodes";
import Hls from "hls.js";
import { getEpisodesServer } from "@/services/getEpisodesServer";
import { AnimeServerType } from "@/types/AnimeServer";
import { getVideoSources } from "@/services/getVideoSources";
import { EpisodesType } from "@/types/EpisodesListType";
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";

export default function WatchPage() {
  const [animeDetails, setAnimeDetails] = useState<AnimeDetailsType | null>(
    null
  );
  const animeDetailsInfo = animeDetails?.anime.info;
  const animeDetailsMoreInfo = animeDetails?.anime.moreInfo;
  const recommendedAnimes = animeDetails?.recommendedAnimes || [];
  const mostPopularAnimes = animeDetails?.mostPopularAnimes || [];
  const relatedAnimes = animeDetails?.relatedAnimes || [];
  const seasons = animeDetails?.seasons || [];

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { id } = useParams() as { id: string };
  const [episodes, setEpisodes] = useState<EpisodesType[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [category] = useState<"sub" | "dub">("dub");
  const [server] = useState<string>("hd-2");
  const [servers, setServers] = useState<AnimeServerType | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [detailsRes, episodesRes] = await Promise.all([
          getAnimeDetails(id),
          getAnimeEpisodes(id),
        ]);
        setAnimeDetails(detailsRes.data);
        setEpisodes(episodesRes.data.episodes);
        setTotalEpisodes(episodesRes.data.totalEpisodes);
      } catch (err) {
        console.error("Fetching error", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (episodes.length > 0 && !selectedEpisodeId) {
      setSelectedEpisodeId(episodes[0].episodeId);
    }
  }, [episodes, selectedEpisodeId]);

  useEffect(() => {
    const loadVideoData = async () => {
      if (!selectedEpisodeId) return;

      try {
        const serverRes = await getEpisodesServer(selectedEpisodeId);
        setServers(serverRes.data);
        console.log(servers);

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
          console.warn("No video source found for", {
            selectedEpisodeId,
            server,
            category,
          });
          setVideoUrl(null);
        }
      } catch (err) {
        console.error("Error", err);
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
    <div className="anime-details p-6">
      {isLoading && <Loader />}
      {!isLoading && (
        <div className="anime-details__content">
          <div className="anime-details__player">
            <div className="anime-details__watch">
              <div className="anime-details__watch-bio">
                <div>
                  <img
                    className="anime-details__watch-bio-page"
                    src={animeDetailsInfo?.poster}
                    alt={animeDetailsInfo?.name}
                  />

                  <div>
                    {animeDetailsInfo && <Info info={animeDetailsInfo} />}
                    {animeDetailsMoreInfo && (
                      <MoreInfo moreInfo={animeDetailsMoreInfo} />
                    )}
                  </div>
                </div>
                <div className="video-player">
                  <div className="video-player__content">
                    <VideoPlayer
                      episodes={episodes}
                      totalEpisodes={totalEpisodes}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {seasons.length > 0 && (
            <div className="anime-details__seasons">
              <h2>More Seasons</h2>
              <Seasons seasons={seasons} />
            </div>
          )}

          <div className="anime-details__relatedAnime">
            <h2>Related Anime</h2>
            <SwiperCard catalog={relatedAnimes} />
          </div>

          <div className="anime-details__recommendedAnimes">
            <h2>Recommended Animes</h2>
            <SwiperCard catalog={recommendedAnimes} />
          </div>

          <div className="anime-details__mostPopularAnimes">
            <h2>Most Popular Animes</h2>
            <SwiperCard catalog={mostPopularAnimes} />
          </div>
        </div>
      )}
    </div>
  );
}
