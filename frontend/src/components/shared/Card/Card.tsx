"use client";
import Link from "next/link";
import { AnimeCard } from "../../../types/AnimeCard";
import "./Card.scss";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Convertor } from "@/helper/Convertor";
import { TbPlayerPlay } from "react-icons/tb";

type props = {
  anime: AnimeCard;
};

export const Card: React.FC<props> = ({ anime }) => {
  const pathname = usePathname();

  return (
    <Link
      href={`${
        pathname.includes("watch") ? `${anime.id}` : `watch/${anime.id}`
      }`}
    >
      <article className="anime-card">
        <div className="anime-card__img-container">
          <Image
            src={anime.poster ? Convertor(anime.poster) : "/default-poster.jpg"}
            alt={anime.name || "Anime Poster"}
            fill
            sizes="auto"
          />
        </div>
        <div className="anime-card__text">
          <h3 className="anime-card__title">{anime.name}</h3>
        </div>
        <div
          className="anime-card--hover"
          style={{
            backgroundImage: `url(${Convertor(
              anime.poster || "/default-poster.jpg"
            )})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <TbPlayerPlay />
        </div>
      </article>
    </Link>
  );
};
