"use client";
import { useRouter } from "next/navigation";

const letters: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const AZFilter = () => {
  const router = useRouter();

  const handleClick = (letter: string) => {
    router.push(`/animes/az-list?letter=${letter}&page=1`);
  };
  return (
    <div className="az-filter">
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={() => handleClick(letter)}
          className="az-button"
        >
          {letter}
        </button>
      ))}
    </div>
  );
};
