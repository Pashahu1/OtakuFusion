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
        slidesPerView={"auto"}
        // breakpoints={{
        //   0: {
        //     slidesPerView: 2,
        //   },
        //   600: {
        //     slidesPerView: 4,
        //   },
        //   1200: {
        //     slidesPerView: 6,
        //   },
        //   1980: {
        //     slidesPerView: 10,
        //   },
        //   2560: {
        //     slidesPerView: 12,
        //   },
        // }}
      >
        {catalog.map((anime: AnimeCard) => (
          <SwiperSlide key={anime.rank} style={{ width: "260px" }}>
            <Card anime={anime} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
