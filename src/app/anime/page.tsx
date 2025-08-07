"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/Card/Card";
import { Pagination } from "@/components/Pagination/Pagination";
import { getCategory } from "@/services/getCategory";
import { categoryes } from "../../shared/data/category";
import { AnimeListLayout } from "@/components/Layout/AnimeListLayout";
import { InitialLoader } from "@/components/ui/InitialLoader/InitialLoader";
import type { AnimeInfo } from "@/shared/types/GlobalTypes";
import "./anime.scss";
import { WrapperLayout } from "@/components/Layout/WrapperLayout";
import ErrorMessage from "@/components/Error/ErrorMessage";

export default function Animes() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = Number(searchParams.get("page") || "1");
  const [category, setCategory] = useState<AnimeInfo[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("most-favorite");

  let titleCategory = selectedCategory
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    const fetchAnimesCategory = async () => {
      setIsLoading(true);
      try {
        const res = await getCategory(selectedCategory, pageParam);
        setCategory(res.results.data);
        setTotalPage(res.results.totalPages);
        setIsLoading(false);
      } catch {
        console.error("Failed getting of data");
        setError(true);
      }
    };

    fetchAnimesCategory();
  }, [pageParam, selectedCategory]);

  const handleCategory = (category: string) => {
    if (category === selectedCategory) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });

    setSelectedCategory(category);
  };

  return (
    <div className="anime">
      {isLoading && <InitialLoader />}
      {error && <ErrorMessage message="Failed to load anime page." />}
      {!isLoading && (
        <WrapperLayout>
          <div className="anime__content">
            <div className="anime__control-panel">
              {categoryes.map((cat, idx) => (
                <button
                  className={`anime__button ${cat === selectedCategory ? "anime__button--active" : ""}`}
                  key={idx}
                  onClick={() => handleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <AnimeListLayout title={titleCategory}>
              {category.map((anime) => (
                <Card key={anime.id} anime={anime} />
              ))}
            </AnimeListLayout>

            <Pagination pageCount={totalPage} currentPage={pageParam} />
          </div>
        </WrapperLayout>
      )}
    </div>
  );
}
