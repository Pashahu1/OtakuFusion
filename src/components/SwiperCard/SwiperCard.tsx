import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Card } from "@/components/Card/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { AnimeInfo } from "../../shared/types/GlobalTypes";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "./SwiperCard.scss";

type Props = {
  catalog: AnimeInfo[];
};

const SwiperCard = ({ catalog }: Props) => {
  return (
    <div className="swiper-card">
      <button className="custom-nav button-next" aria-label="Next slide">
        <ChevronRight />
      </button>
      <button className="custom-nav button-prev" aria-label="Previous slide">
        <ChevronLeft />
      </button>

      <Swiper
        modules={[Navigation]}
        slidesPerView={"auto"}
        spaceBetween={20}
        navigation={{
          nextEl: ".button-next",
          prevEl: ".button-prev",
        }}
        breakpoints={{
          0: {
            slidesPerView: 2,
          },
          600: {
            slidesPerView: 4,
          },
          1200: {
            slidesPerView: 7,
          },
          1980: {
            slidesPerView: 10,
          },
        }}
      >
        {catalog.map((anime: AnimeInfo, idx) => (
          <SwiperSlide className="swiper-card__slide" key={idx}>
            <Card anime={anime} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
export default SwiperCard;
