import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { AnimeCard } from "../../types/AnimeCard";
import { Card } from "../shared/Card/Card";

type Props = {
  catalog: AnimeCard[];
};

export const SwiperCard: React.FC<Props> = ({ catalog }) => {
  return (
    <div className="swiper-card">
      <Swiper
        breakpoints={{
          0: {
            slidesPerView: 2,
          },
          800: {
            slidesPerView: 5,
          },
          1200: {
            slidesPerView: 8,
          },
          1980: {
            slidesPerView: 10,
          },
        }}
      >
        {catalog.map((anime: AnimeCard) => (
          <SwiperSlide key={anime.rank}>
            <Card anime={anime} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
