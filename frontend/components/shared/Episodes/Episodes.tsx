import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Episode } from "../../../types/AnimeTypes";
import { getEpisodes } from "../../../api/getEpisodes";

type Props = {
  animeId: string;
  currentEpisodeId: string;
};

export const Episodes: React.FC<Props> = ({ animeId, currentEpisodeId }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const data = await getEpisodes(animeId);
        setEpisodes(data);
      } catch {
        console.error("Error fetching episodes");
      }
    };

    fetchEpisodes();
  }, [animeId]);

  if (!isClient) {
    return null;
  }

  return (
    <div>
      <h2>Episodes</h2>
      <ul>
        {episodes.map((episode) => (
          <li key={episode.episodeId}>
            <p
              onClick={() =>
                router.push(`?ep=${encodeURIComponent(episode.number)}`)
              }
              className={currentEpisodeId === episode.episodeId ? "active" : ""}
            >
              {episode.number}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
