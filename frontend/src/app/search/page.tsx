"use client";
import { useEffect, useState } from "react";
import "./Search.scss";
import { getAnimeSearch } from "../../services/getAnimeSearch";
import { useRouter } from "next/navigation";

let debounceTimeout: NodeJS.Timeout;

export default function Search() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  console.log(animes);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) return;

    // clearTimeout(debounceTimeout);

    // debounceTimeout = setTimeout(async () => {
    //   try {
    //     const kebabQuery = query.trim().toLowerCase().replace(/\s+/g, "-");
    //     const data = await getAnimeSearch(1, kebabQuery);

    //     setAnimes(data.data.response);

    //     router.push(`/search?q={query}&page={page}`);
    //   } catch {
    //     setAnimes([]);
    //   }
    // }, 100);
  }, [query]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="search-page">
      {/* <input
        className="search-page__input"
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search..."
      /> */}
      <div className="search-page__content">
        <ul className="search-page">
          {/* {animes.map((anime) => (
            <li key={anime.id}>
              <Card anime={anime} />
            </li>
          ))} */}
        </ul>
      </div>
    </div>
  );
}
