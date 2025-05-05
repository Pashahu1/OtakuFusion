"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getAZList } from "../../../../api/getAZList";
import { Card } from "../../../../components/shared/Card/Card";
import { useActions } from "../../../../hooks/useActions";
import { RootState } from "../../../../store/store";
import { useSelector } from "react-redux";
import "./animes.scss";
import { Pagination } from "../../../../components/Pagination/Pagination";

export default function AZListPage() {
  // const search = useSearchParams();
  // const letter = search.get("letter") || "#";
  // const page = search.get("page") || "1";

  // const { getAZPageCatalog } = useActions();
  // const aZList = useSelector((state: RootState) => state.animeAzList);
  // const animes = aZList.response;
  // const totalPages = aZList.pageInfo.totalPages;

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await getAZList(Number(page));
  //       getAZPageCatalog(res.data);
  //     } catch {
  //       console.error("Error fetching data");
  //     }
  //   };
  //   fetchData();
  // }, [page]);

  // const filteredAnimes = animes.filter((anime) => {
  //   const title = anime.title.toUpperCase();
  //   switch (letter) {
  //     case "#":
  //       return !/^[A-Z]/.test(title[0]);
  //     case "0-9":
  //       return /^[0-9]/.test(title[0]);
  //     case "All":
  //       return anime;
  //     default:
  //       return title.startsWith(letter);
  //   }
  // });

  return (
    <div className="animes-page">
      <h1 className="animes-page__title">A-Z List</h1>
      <div className="animes-page__container">
        {/* {filteredAnimes.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}
      

      <Pagination page={page} total={totalPages} /> */}
      </div>
    </div>
  );
}
