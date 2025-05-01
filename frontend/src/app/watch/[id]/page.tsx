"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAnimeDetails } from "../../../../api/getAnimeDetails";
import { AnimeDetails } from "../../../../types/AnimeTypes";
import { getEpisodes } from "../../../../api/getEpisodes";

export default function WatchPage() {
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const { id } = useParams() as { id: string };

  useEffect(() => {
    const details = async () => {
      if (id) {
        const res = await getAnimeDetails(id);
        setAnimeDetails(res.data);
        console.log(getEpisodes(id));
      }
    };
    details();
  }, [id]);

  return (
    <div>
      <p>{animeDetails?.MAL_score}</p>
      <p>
        {animeDetails?.aired.from}
        <span>{animeDetails?.aired.to}</span>
      </p>
      <p>{animeDetails?.alternativeTitle}</p>
      <p>{animeDetails?.duration}</p>
      <p>
        <span>{animeDetails?.episodes.dub}</span>
        <span>{animeDetails?.episodes.eps}</span>
        <span>{animeDetails?.episodes.sub}</span>
      </p>
      <p>{animeDetails?.genres}</p>
      <p>{animeDetails?.japanese}</p>
      <img src={animeDetails?.poster} alt={animeDetails?.title} />
      <p>{animeDetails?.premiered}</p>
      <p>{animeDetails?.producers}</p>
      <p>{animeDetails?.rating}</p>
      <p>{animeDetails?.status}</p>
      <p>{animeDetails?.studios}</p>
      <p>{animeDetails?.synonyms}</p>
      <p>{animeDetails?.synopsis}</p>
      <p>{animeDetails?.title}</p>
      <p>{animeDetails?.type}</p>
    </div>
  );
}
