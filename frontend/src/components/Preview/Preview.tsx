"use client";
import {
  A11y,
  Navigation,
  Pagination,
  Scrollbar,
  Autoplay,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "./Preview.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { SwiperCard } from "../SwiperCard/SwiperCard";
// import myHeroesAcademLogo from "../../../public/MHAVigilantes.png";
// import myHeroeBack from "../../../public/Vigilantes.jpg";

// import fireForceLogo from "../../../public/FireForce.png";
// import fireforceBack from "../../../public/backdropfc_wide.jpg";

// import onePiceLogo from "../../../public/Egghead.png";
// import onePieceBack from "../../../public/backdrop_wide.jpeg";

// import windBreakerBack from "../../../public/WindBreak.jpg";
// import windBreakerLogo from "../../../public/Wind_Breaker_Anime_Logo.png";

// import toBeHeroBack from "../../../public/to-be-hero-x.jpg";
// import toBeHeroXLogo from "../../../public/toBeHeroXLogo.svg";

import previewSwiperData from "../../../data/previewSwiperData.json";

// const previewSwiper = [
//   {
//     id: "Fire Force Season 3",
//     titlePage: fireForceLogo,
//     poster: fireforceBack,
//   },
//   {
//     id: "My Hero Academia: Vigilantes",
//     titlePage: myHeroesAcademLogo,
//     poster: myHeroeBack,
//   },
//   {
//     id: "One Piece",
//     titlePage: onePiceLogo,
//     poster: onePieceBack,
//   },
//   {
//     id: "Wind Breaker Season 2",
//     titlePage: windBreakerLogo,
//     poster: windBreakerBack,
//   },
//   {
//     id: "To Be Hero X",
//     titlePage: toBeHeroXLogo,
//     poster: toBeHeroBack,
//   },
// ];

export const Preview = () => {
  const homeCatalog = useSelector((state: RootState) => state.animeHomeCatalog);
  console.log(homeCatalog.trendingAnimes);
  return (
    <div className="preview">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        slidesPerView={1}
        style={{ height: "100vh", position: "relative" }}
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
        {previewSwiperData.map((anime) => (
          <SwiperSlide key={anime.id}>
            <div
              className="preview-card"
              style={{
                backgroundImage: `url(${anime.poster})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
            >
              <div className="preview-card__header">
                <div className="preview-card__overlay">
                  <img
                    className="preview-card__overlay-title-page"
                    src={anime.titlePage}
                    alt={anime.id}
                  />
                  <p className="preview-card__overlay-text">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Architecto placeat aliquid nisi minima libero adipisci sequi
                    eligendi soluta ullam accusamus repudiandae in illo, facere
                    blanditiis fugiat illum? Sunt, aut voluptates.
                  </p>
                  <button className="preview-card__overlay-button">
                    Watch Season 1 Ep 1
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="preview-card__pagination"></div>
      </Swiper>
      <div className="preview-card__content">
        <h1 className="preview-card__title">Trending</h1>

        <div className="preview-card__container">
          <SwiperCard catalog={homeCatalog?.topAiringAnimes || []} />
        </div>
      </div>
    </div>
  );
};
