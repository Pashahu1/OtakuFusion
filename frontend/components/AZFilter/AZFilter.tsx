"use client";
import { useRouter, useSearchParams } from "next/navigation";
import "./AZFilter.scss";

const letters: string[] = [
  "0-9",
  "All",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "#",
];

export const AZFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || "1";

  const handleClick = (letter: string) => {
    router.push(`/animes?letter=${letter}&page=${currentPage}`);
  };

  return (
    <div className="az-filter">
      <ul className="az-filter__list">
        {letters.map((letter) => (
          <li
            key={letter}
            onClick={() => handleClick(letter)}
            className="az-filter__item"
          >
            {letter}
          </li>
        ))}
      </ul>
    </div>
  );
};
