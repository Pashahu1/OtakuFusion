"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAnimeDetails } from "../../../services/getAnimeDetails";
import { AnimeDetailsType } from "../../../types/AnimeDetailsType";
import { Card } from "../../../components/shared/Card/Card";
import { EpisodesList } from "../../../components/Episodes/EpisodesList";
import "./animeDetails.scss";
import { SwiperCard } from "@/components/SwiperCard/SwiperCard";
import Link from "next/link";

export default function WatchPage() {
  const [animeDetails, setAnimeDetails] = useState<AnimeDetailsType | null>(
    null
  );

  const { id } = useParams() as { id: string };
  const animeDetailsInfo = animeDetails?.anime.info;
  const animeDetailsMoreInfo = animeDetails?.anime.moreInfo;
  const recommendedAnimes = animeDetails?.recommendedAnimes;
  const mostPopularAnimes = animeDetails?.mostPopularAnimes;
  const relatedAnimes = animeDetails?.relatedAnimes;
  const seasons = animeDetails?.seasons || [];

  useEffect(() => {
    const details = async () => {
      try {
        if (id) {
          const res = await getAnimeDetails(id);
          setAnimeDetails(res.data);
        }
      } catch {
        console.error("Failed fetching data");
      }
    };
    details();
  }, [id]);

  return (
    <div className="anime-details p-6">
      <h1 className="text-2xl font-bold mb-4">Аніме Плеер</h1>

      <div className="anime-details__content">
        <div className="anime-details__player">
          <div className="anime-details__watch">
            <h2 className="anime-details__watch-title">
              {animeDetailsInfo?.name}
            </h2>

            {/* <p className="anime-details__watch-description">{animeDetailsInfo?.malId}</p> */}
            <div className="anime-details__watch-bio">
              <img
                className="anime-details__watch-bio-page"
                src={animeDetailsInfo?.poster}
                alt={animeDetailsInfo?.name}
              />

              <div>
                <h2>{animeDetailsMoreInfo?.aired}</h2>
                <p>{animeDetailsMoreInfo?.duration}</p>
                <p>{animeDetailsMoreInfo?.genres}</p>
                <p>{animeDetailsMoreInfo?.japanese}</p>
                <p>{animeDetailsMoreInfo?.malscore}</p>
                <p>{animeDetailsMoreInfo?.premiered}</p>
                <p>{animeDetailsMoreInfo?.producers}</p>
                <p>{animeDetailsMoreInfo?.status}</p>
                <p>{animeDetailsMoreInfo?.studios}</p>
                <p>{animeDetailsMoreInfo?.synonyms}</p>
                <p className="anime-details__watch-bio-description">
                  {animeDetailsInfo?.description}
                </p>
              </div>
            </div>

            <div className="anime-details__watch-player">
              <div className="Player">Player</div>
            </div>

            {/* <EpisodesList animeId={id} /> */}
          </div>
        </div>

        <div className="anime-details__seasons">
          {seasons.length > 0 && (
            <>
              <h2>More Seasons</h2>
              <div className="seasons">
                {seasons?.map((item) => (
                  <Link
                    href={`/watch/${item.id}`}
                    className="seasons__item"
                    key={item.id}
                  >
                    <div
                      style={{
                        background: `url('${item.poster}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        objectFit: "cover",
                        height: "78px",
                        filter: `blur(3px)`,
                      }}
                    ></div>
                    <h6 className="seasons__name">{item.name}</h6>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="anime-details__relatedAnime">
          <h2>Related Anime</h2>
          <SwiperCard catalog={relatedAnimes || []} />
        </div>

        <div className="anime-details__recommendedAnimes">
          <h2>Recommended Animes</h2>
          <SwiperCard catalog={recommendedAnimes || []} />
        </div>

        <div className="anime-details__mostPopularAnimes">
          <h2>Most Popular Animes</h2>
          <SwiperCard catalog={mostPopularAnimes || []} />
        </div>
      </div>
    </div>
  );
}
