import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { AnimeItem } from "../../types/AnimeTypes";
import { Card } from "../shared/Card/Card";

type Props = {
  catalog: AnimeItem[];
};

export const SwiperCard: React.FC<Props> = ({ catalog }) => {
  return (
    <div className="swiper-card">
      <Swiper
        breakpoints={{
          0: {
            slidesPerView: 2,
          },
          1200: {
            slidesPerView: 6,
          },
          1980: {
            slidesPerView: 8,
          },
        }}
      >
        {catalog.map((anime: AnimeItem) => (
          <SwiperSlide key={anime.id}>
            <Card
              anime={{
                ...anime,
                alternativeTitle: anime.alternativeTitle || "N/A",
                episodes: anime.episodes || 0,
                poster: anime.poster || "default-poster.jpg",
                type: anime.type || "Unknown",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
