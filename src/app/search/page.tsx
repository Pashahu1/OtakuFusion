"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./Search.scss";
import { getAnimeSearch } from "@/services/getAnimeSearch";
import { Card } from "@/components/Card/Card";
import { useRouter } from "next/navigation";
import { AnimeListLayout } from "@/components/Layout/AnimeListLayout";
import { debounce } from "lodash";
import ErrorMessage from "@/components/Error/ErrorMessage";
import { InitialLoader } from "@/components/ui/InitialLoader/InitialLoader";
import { SkeletonCard } from "@/components/Skeleton/SkeletonCard/SkeletonCard";

export default function Search() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleDebounced = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 300),
    []
  );

  useEffect(() => {

    const fetchSearchResults = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        setSearch("");
        router.push("/search");
        return;
      }
      setIsLoading(true);
      try {
        const response = await getAnimeSearch(search);

        const filteredResults = response.data.filter(
          (anime: { title: string }) =>
            anime.title.toLowerCase().includes(search.toLowerCase())
        );
        setSearchResults(filteredResults);
        router.replace(`/search?keyword=${encodeURIComponent(search)}`);
        setError(false);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearch("");
        setSearchResults([]);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [search, router]);

  return (
    <div className="search-page">
      <div className="search-page__input">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleDebounced(e.target.value)}
        />
      </div>

      <AnimeListLayout>
        {error && <ErrorMessage message="Failed to get results." />}
        {!isLoading && !error && searchResults.length === 0 && (
          <p className="search-page__empty">Please enter Anime name.</p>
        )}

        {isLoading &&
          Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}

        {!isLoading && searchResults.length > 0 && (
          <>
            {searchResults.map((anime, idx) => (
              <Card key={anime + idx} anime={anime} />
            ))}
          </>
        )}
      </AnimeListLayout>
    </div>
  );
}
