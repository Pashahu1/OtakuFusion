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

import { HomePageType } from "@/types/HomePageTypes";
import { Convertor } from "@/helper/Convertor";
import Link from "next/link";

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
        {homeCatalog?.spotlightAnimes?.map((anime) => (
          <SwiperSlide key={anime.id}>
            <div
              className="preview-card"
              style={{
                backgroundImage: `url(${Convertor(anime.poster)})`,
                backgroundSize: "cover",
                backgroundPosition: "start",
                backgroundRepeat: "no-repeat",
                objectFit: "cover",
              }}
            >
              <div className="preview-card__header">
                <div className="preview-card__overlay">
                  <h1>{anime.name}</h1>
                  <p className="preview-card__overlay-text">
                    {anime.description}
                  </p>
                  <Link href={`/watch/${anime.id}`}>
                    <button className="preview-card__overlay-button">
                      Watch
                    </button>
                  </Link>
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
          <SwiperCard catalog={homeCatalog?.trendingAnimes || []} />
        </div>
      </div>
    </div>
  );
};
