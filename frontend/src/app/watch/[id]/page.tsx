"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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

import { EpisodesType } from "@/types/EpisodesListType";
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";

export default function WatchPage() {
  const [animeDetails, setAnimeDetails] = useState<AnimeDetailsType | null>(
    null
  );
  const { id } = useParams() as { id: string };
  const [episodes, setEpisodes] = useState<EpisodesType[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const animeDetailsInfo = animeDetails?.anime.info;
  const animeDetailsMoreInfo = animeDetails?.anime.moreInfo;
  // const recommendedAnimes = animeDetails?.recommendedAnimes || [];
  // const mostPopularAnimes = animeDetails?.mostPopularAnimes || [];
  // const relatedAnimes = animeDetails?.relatedAnimes || [];
  const seasons = animeDetails?.seasons || [];

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

  return (
    <div className="anime-details">
      {isLoading && <Loader />}
      {!isLoading && (
        <div className="anime-details__content">
          <div className="anime-details__player">
            <div className="anime-details__watch">
              <div className="video-player">
                <div className="video-player__content">
                  <VideoPlayer
                    episodes={episodes}
                    totalEpisodes={totalEpisodes}
                  />
                  {/* <Suspense fallback={<Loader />}></Suspense> */}
                </div>
              </div>
              <div className="anime-details__watch-bio">
                <div>
                  {/* <img
                    className="anime-details__watch-bio-page"
                    src={animeDetailsInfo?.poster}
                    alt={animeDetailsInfo?.name}
                  /> */}

                  <div>
                    {animeDetailsInfo && <Info info={animeDetailsInfo} />}
                    {animeDetailsMoreInfo && (
                      <MoreInfo moreInfo={animeDetailsMoreInfo} />
                    )}
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

          {/* <div className="anime-details__relatedAnime">
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
          </div> */}
        </div>
      )}
    </div>
  );
}
