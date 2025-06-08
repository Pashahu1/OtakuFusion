"use client";

import { useEffect, useState } from "react";
import "./Search.scss";
import { getAnimeSearch } from "@/services/getAnimeSearch";
import { Card } from "@/components/shared/Card/Card";
import { useRouter } from "next/navigation";

export default function Search() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (search.trim() === "") {
        setSearchResults([]);
        setSearch("");
        router.push("/search");

        return;
      }

      try {
        const response = await getAnimeSearch(search);
        const filteredResults = response.data.animes.filter(
          (anime: { name: string }) =>
            anime.name.toLowerCase().includes(search.toLowerCase())
        );
        setSearchResults(filteredResults);
        router.push(`/search?q=${search}`);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearch("");
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [search]);

  return (
    <div className="search-page">
      <div className="search-page__input">
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearchChange}
        />
      </div>

      <div className="search-page__results">
        {searchResults.map((anime, idx) => (
          <Card key={idx} anime={anime} />
        ))}
      </div>
    </div>
  );
}
