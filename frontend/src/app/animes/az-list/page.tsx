"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAZList } from "../../../../api/getAZList";
import { Card } from "../../../../components/shared/Card/Card";
import { AZFilter } from "../../../../components/AZFilter/AZFilter";
import { AnimeCard } from "../../../../types/AnimeTypes";

export default function AZListPage() {
  const search = useSearchParams();
  const letter = search.get("letter") || "A";
  const page = search.get("page") || "1";
  const [animes, setAnimes] = useState<AnimeCard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAZList(Number(page));
        setAnimes(res.data.response);
      } catch {
        console.error("Error fetching data");
      }
    };
    fetchData();
  }, [page]);

  const filteredAnimes = animes.filter((anime) => {
    const title = anime.title.toUpperCase();
    if (title === "#") {
      return /^[A-Z]/.test(title[0]);
    }

    return title.startsWith(letter);
  });

  return (
    <div>
      <h1>A-Z List</h1>
      <AZFilter />
      {filteredAnimes.map((anime) => (
        <Card key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
