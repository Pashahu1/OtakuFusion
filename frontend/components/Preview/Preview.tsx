"use client";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "./Preview.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { SwiperCard } from "../SwiperCard/SwiperCard";
import myHeroesAcademLogo from "../../public/MHAVigilantes.png";
import fireForceLogo from "../../public/FireForce.png";
import onePiceLogo from "../../public/Egghead.png";
import fireforceBack from "../../public/backdropfc_wide.jpg";
import myHeroeBack from "../../public/backdropmg_wide.jpg";
import onePieceBack from "../../public/backdrop_wide.jpg";
import toBeHeroBack from "../../public/to-be-hero-x.jpg";
import windBreakerBack from "../../public/backdropwb_wide.jpg";
import toBeHeroXLogo from "../../public/toBeHeroXLogo.svg";
import windBreakerLogo from "../../public/Wind_Breaker_Anime_Logo.png";

const previewSwiper = [
  {
    id: "Fire Force Season 3",
    titlePage: fireForceLogo,
    poster: fireforceBack,
  },
  {
    id: "My Hero Academia: Vigilantes",
    titlePage: myHeroesAcademLogo,
    poster: myHeroeBack,
  },
  {
    id: "One Piece",
    titlePage: onePiceLogo,
    poster: onePieceBack,
  },
  {
    id: "Wind Breaker Season 2",
    titlePage: windBreakerLogo,
    poster: windBreakerBack,
  },
  {
    id: "To Be Hero X",
    titlePage: toBeHeroXLogo,
    poster: toBeHeroBack,
  },
];

export const Preview = () => {
  const homeCatalog = useSelector((state: RootState) => state.animeHomeCatalog);

  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      slidesPerView={1}
      style={{ height: "100vh" }}
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
      {previewSwiper.map((anime) => (
        <SwiperSlide key={anime.id}>
          <div
            className="preview-card"
            style={{
              backgroundImage: `url(${anime.poster.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <p className="preview-card__overlay">
              <img
                className="preview-card__title"
                src={anime.titlePage.src}
                alt={anime.id}
              />
            </p>
          </div>
        </SwiperSlide>
      ))}
      <div className="preview-card__header">
        <div className="preview-card__content">
          <h1 className="preview-card__title">Trending</h1>

          <div className="preview-card__container">
            <SwiperCard catalog={homeCatalog.trending} />
          </div>
        </div>
      </div>
      <div className="preview-card__pagination"></div>
    </Swiper>
  );
};
