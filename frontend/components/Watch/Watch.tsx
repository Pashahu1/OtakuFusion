"use client";
import { useEffect, useState } from "react";
import { getEpisodes } from "../../api/getEpisodes";
import { Episode } from "../../types/AnimeTypes";
import { getServerEpisodes } from "../../api/getServerEpisodes";
import { useParams, useSearchParams } from "next/navigation";

type Props = {
  episodeId: string;
};

export const Watch: React.FC<Props> = ({ episodeId }) => {
  // const [episodes, setEpisodes] = useState<Episode[]>([]);
  // const [server, setServer] = useState<string[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  console.log(episodeId);

  // useEffect(() => {
  //   const fetchingEpisodes = async () => {
  //     try {
  //       const episodesData: Episode[] = await getEpisodes(animeId);
  //       setEpisodes(episodesData);

  //       const currentEpisode = episodesData.find((e) => e.episodeId === ep);

  //       if (currentEpisode) {
  //         const server = await getServerEpisodes(currentEpisode.episodeId);
  //         setServer(server);
  //       }

  //       setLoading(false);
  //     } catch (err: any) {
  //       setError(err.message);
  //       setLoading(false);
  //     }
  //   };

  //   if (animeId && ep) fetchingEpisodes();
  // }, [animeId, ep]);

  // useEffect(() => {
  //   const fetchingEpisodes = async () => {

  // }, [animeId]);

  // console.log(episodes);
  // console.log(server);

  return (
    <div className="anime-player">
      <h1>Аниме Плеер</h1>
      <video src={`https://my-cdn.com/stream/${episodeId}`} controls autoPlay />
    </div>
  );
};
