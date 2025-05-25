"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAZList } from "../../../services/getAZList";
// import "./animes.scss";
import { Card } from "../../../components/shared/Card/Card";
import { AnimeBase } from "@/types/GlobalTypes";

export default function AZListPage() {
  const search = useSearchParams();
  const letter = search.get("letter") || "#";
  const page = search.get("page") || "1";
  const sortOption = search.get("sortOption") || "0-9";

  const [anime, setAnime] = useState<AnimeBase[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAZList(sortOption, Number(totalPages));
        setAnime(res.data.animes);
        setTotalPages(res.data.totalPages);
      } catch {
        console.error("Error fetching data");
      }
    };
    fetchData();
  }, [totalPages, sortOption, page]);

  const filteredAnimes = anime.filter((an) => {
    const title = an?.name.toUpperCase();
    switch (letter) {
      case "#":
        return !/^[A-Z]/.test(title[0]);
      case "0-9":
        return /^[0-9]/.test(title[0]);
      case "All":
        return an;
      default:
        return title.startsWith(letter);
    }
  });

  return (
    <div className="animes-page">
      <h1 className="animes-page__title">A-Z List</h1>
      <div className="animes-page__container">
        {filteredAnimes.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}

        {/* <Pagination page={page} total={totalPages} /> */}
      </div>
    </div>
  );
}
