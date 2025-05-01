import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AnimeItem } from "../../types/AnimeTypes";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "./Preview.scss";
type Props = {
  catalog: AnimeItem[];
};

export const Preview = ({ catalog }: { catalog: any[] }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      slidesPerView={1}
      pagination={{
        el: ".preview-car__pagination",
        clickable: true,
      }}
      navigation
    >
      {catalog.map((anime) => (
        <SwiperSlide key={anime.id}>
          <div className="preview-card">
            <img
              className="preview-card__img"
              src={anime.poster}
              alt="Anime Cover"
            />
          </div>
        </SwiperSlide>
      ))}

      <div className="preview-card__pagination"></div>
    </Swiper>
  );
};
