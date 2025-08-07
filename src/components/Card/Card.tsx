import Link from "next/link";
import type { AnimeInfo } from "../../shared/types/GlobalTypes";
import "./Card.scss";
import Image from "next/image";
import { Convertor } from "@/helper/Convertor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClosedCaptioning, faMicrophone } from "@fortawesome/free-solid-svg-icons";

type Props = {
  anime: AnimeInfo;
};

export const Card = ({ anime }: Props) => {
  return (
    <Link href={`/watch/${anime.id}`}>
      <article className="anime-card flex flex-col gap-[10px] relative">
        <div className="anime-card__img-container">
          <Image
            className="anime-card__link"
            src={anime.poster ? Convertor(anime.poster) : "/sukuna-error.jpg"}
            alt={`Poster of ${anime.title}`}
            fill
            sizes="300px"
            loading="lazy"
          />
        </div>
        <div className="anime-card__text">
          <h3 className="anime-card__title">{anime.title}</h3>
        </div>
        <div className="flex absolute top-0 left-0 right-0 ">
          {anime.tvInfo?.sub && (
            <div className="flex space-x-1 justify-center items-center bg-[#ff640a] rounded-[2px] px-[4px] text-black py-[2px]">
              <FontAwesomeIcon
                icon={faClosedCaptioning}
                className="text-[12px]"
              />

              <p className="text-[12px] font-bold">
                {anime.tvInfo.sub}
              </p>
            </div>
          )}
          {anime.tvInfo?.dub && (
            <div className="flex space-x-1 justify-center items-center bg-[#B9E7FF] rounded-[2px] px-[4px] text-black py-[2px]">
              <FontAwesomeIcon
                icon={faMicrophone}
                className="text-[12px]"
              />

              <p className="text-[12px] font-bold">
                {anime.tvInfo.sub}
              </p>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};
