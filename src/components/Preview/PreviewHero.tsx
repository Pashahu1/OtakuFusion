import {
  A11y,
  Navigation,
  Pagination,
  Scrollbar,
  Autoplay,
} from "swiper/modules";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Convertor } from "@/helper/Convertor";
import "swiper/css/effect-fade";
import { EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "./PreviewHero.scss";
import { Button } from "../Button/Button";
import Image from "next/image";
import type { SpotlightAnime, TrendingAnime } from "@/shared/types/GlobalTypes";
import dynamic from "next/dynamic";
import { HandleTextSliced } from "@/helper/TextSliced";

const LazySwiperCard = dynamic(
  () => import("@/components/SwiperCard/SwiperCard"),
  {
    ssr: false,
  }
);

type Props = {
  spotlights: SpotlightAnime[];
  trending: TrendingAnime[];
};

const Preview = ({ spotlights, trending }: Props) => {
  return (
    <div className="preview">
      <div className="preview__slider">
        <Swiper
          modules={[
            Navigation,
            Pagination,
            Scrollbar,
            A11y,
            Autoplay,
            EffectFade,
          ]}
          slidesPerView={1}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          pagination={{
            el: ".preview__pagination",
            clickable: true,
          }}
          navigation
          autoplay={{
            delay: 5000,
          }}
          loop={true}
        >
          {spotlights?.map((anime) => (
            <SwiperSlide key={anime.id}>
              <div className="preview__slide">
                <Image
                  src={Convertor(anime.poster)}
                  alt={anime.title}
                  fill
                  className="preview__bg-image"
                  decoding="async"
                  loading="eager"
                  sizes="100vw"
                  quality={80}
                />
                <div className="preview__shine" />

                <div className="preview__overlay">
                  <div className="preview__overlay-inner">
                    <h1 className="preview__title">{anime.title}</h1>
                    <p className="preview__text">
                      {HandleTextSliced(anime.description)}
                    </p>
                    <Link href={`/watch/${anime.id}`}>
                      <Button className="preview__button">Watch Ep 1</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          <div className="preview__pagination"></div>
        </Swiper>
      </div>

      <div className="preview__trending">
        <h2>Trending</h2>
        <div className="preview__trending-container">
          <LazySwiperCard catalog={trending || []} />
        </div>
      </div>
    </div>
  );
};
export default Preview;
