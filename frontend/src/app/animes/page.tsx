"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getGenreAnime } from "../../services/getGenreAnime";
import { Card } from "../../components/shared/Card/Card";
import { Pagination } from "../../components/Pagination/Pagination";
import "./animes.scss";
import { error } from "console";

export default function Animes() {
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page") || "1");
  const [genre, setGenre] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(0);

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        const res = await getGenreAnime("shounen", pageParam);
        setGenre(res.data.animes);
        setTotalPage(res.data.totalPages);
      } catch {
        console.error("Failed getting of data");
      }
    };

    fetchGenre();
  }, [pageParam]);

  return (
    <div className="animes">
      <div className="animes__content">
        <div className="animes-page__container">
          {genre.map((anime) => (
            <Card key={anime.id} anime={anime} />
          ))}
        </div>
        <Pagination page={String(pageParam)} total={totalPage} />
      </div>
    </div>
  );
}
