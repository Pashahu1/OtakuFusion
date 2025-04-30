"use client";
import { useEffect, useState } from "react";
import { Card } from "../../../components/shared/Card/Card";
import { getHomePage } from "../../../api/getHomePage";
import { HomeCatalog } from "../../../types/AnimeTypes";

export default function Anime() {
  const [homeCatalog, setHomeCatalog] = useState<HomeCatalog | null>(null);

  const catalog = {
    genres: homeCatalog?.genres,
    latestCompleted: homeCatalog?.latestCompleted,
    latestEpisode: homeCatalog?.latestEpisode,
    mostFavorite: homeCatalog?.mostFavorite,
    mostPopular: homeCatalog?.mostPopular,
    newAdded: homeCatalog?.newAdded,
    spotlight: homeCatalog?.spotlight,
    top10: {
      today: homeCatalog?.top10.today,
      week: homeCatalog?.top10.week,
      month: homeCatalog?.top10.month,
    },
    topAiring: homeCatalog?.topAiring,
    topUpcoming: homeCatalog?.topUpcoming,
    trending: homeCatalog?.trending,
  };

  useEffect(() => {
    const homePageCatalog = async () => {
      const data = await getHomePage();
      setHomeCatalog(data.data);
    };

    homePageCatalog();
  }, []);

  console.log(homeCatalog);

  return (
    <div>
      <div>
        <h1>Most Favorites</h1>
        <ul>
          {catalog.genres?.map((gen) => (
            <li key={gen}>
              <a href="!#">{gen}</a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Most Popular</h2>
        {catalog.mostPopular?.map((popular) => (
          <Card
            key={popular.id}
            anime={{
              ...popular,
              alternativeTitle: popular.alternativeTitle || "N/A",
              episodes: popular.episodes || 0,
              poster: popular.poster || "default-poster.jpg",
              type: popular.type || "Unknown",
            }}
          />
        ))}
      </div>
    </div>
  );
}
