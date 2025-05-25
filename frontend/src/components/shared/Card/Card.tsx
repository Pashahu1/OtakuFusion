"use client";
import Link from "next/link";
import { AnimeCard } from "../../../types/AnimeCard";
import "./Card.scss";
import Image from "next/image";

type props = {
  anime: AnimeCard;
};

export const Card: React.FC<props> = ({ anime }) => {
  return (
    <Link href={`watch/${anime.id}`}>
      <article className="anime-card">
        <div className="anime-card__img-container">
          <Image
            src={anime.poster || "/default-poster.jpg"}
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
            background: `url(${anime.poster})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2>{anime.name}</h2>
          <p>{anime.jname}</p>
        </div>
      </article>
    </Link>
  );
};
