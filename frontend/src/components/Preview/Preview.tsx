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
import { SwiperCard } from "../SwiperCard/SwiperCard";

import previewSwiperData from "../../../data/previewSwiperData.json";
import { HomePageType } from "@/types/HomePageTypes";

type props = {
  homeCatalog: HomePageType | null;
};

export const Preview = ({ homeCatalog }: props) => {
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
