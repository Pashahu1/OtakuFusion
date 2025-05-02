import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AnimeItem } from "../../types/AnimeTypes";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "./Preview.scss";
import { useSelector } from "react-redux";
import { Card } from "../shared/Card/Card";
import { RootState } from "../../store/store";

export const Preview = () => {
  const homeCatalog = useSelector((state: RootState) => state.animeHomeCatalog);

  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      slidesPerView={1}
      pagination={{
        el: ".preview-card__pagination",
        clickable: true,
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      loop={true}
      navigation
    >
      {homeCatalog?.spotlight.map((anime: AnimeItem) => (
        <SwiperSlide key={anime.id}>
          <div
            className="preview-card"
            style={{
              backgroundImage: `url(${anime.poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="preview-card__overlay">
              <h1>{anime.title}</h1>
            </div>
          </div>
        </SwiperSlide>
      ))}
      <div className="preview-card__content">
        <h1 className="preview-card__title">Trending</h1>
        <div className="preview-card__container">
          {homeCatalog?.spotlight.map((anime: AnimeItem) => (
            <Card
              key={anime.id}
              anime={{
                ...anime,
                alternativeTitle: anime.alternativeTitle || "N/A",
                episodes: anime.episodes || 0,
                poster: anime.poster || "default-poster.jpg",
                type: anime.type || "Unknown",
              }}
            />
          ))}
        </div>
      </div>
      <div className="preview-card__pagination"></div>
    </Swiper>
  );
};
