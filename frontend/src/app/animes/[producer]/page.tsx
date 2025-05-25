"use client";
import { useEffect, useState } from "react";
import { getProducerAnime } from "../../../services/getProducerAnimes";
import { ControlPanel } from "../../../components/ControlPanel/ControlPanel";
import { Pagination } from "../../../components/Pagination/Pagination";
import { Card } from "../../../components/shared/Card/Card";
import { useSearchParams } from "next/navigation";
import { AnimeBase } from "@/types/GlobalTypes";

export default function ProducersAnime() {
  const [anime, setAnime] = useState<AnimeBase[]>([]);
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page") || "1");
  const [name] = useState("toei-animation");
  const [totalPage, setTotalPage] = useState(0);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await getProducerAnime(name, pageParam);

        setAnime(res.data.animes);
        setTotalPage(res.data.totalPages);
      } catch {
        console.error("Faild");
      }
    };

    fetchAnime();
  }, [pageParam, name]);

  return (
    <div className="animes">
      <div className="animes__content">
        <ControlPanel />
        {anime.map((anim) => (
          <Card key={anim.id} anime={anim} />
        ))}
        <Pagination page={String(pageParam)} total={totalPage} />
      </div>
    </div>
  );
}
