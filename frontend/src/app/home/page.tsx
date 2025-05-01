"use client";
import { useEffect, useState } from "react";
import { getHomePage } from "../../../api/getHomePage";
import { HomeCatalog } from "../../../types/AnimeTypes";
import "./HomePage.scss";
import { AnimeSection } from "../../../components/shared/AnimeSection/AnimeSection";
import { Preview } from "../../../components/Preview/Preview";

export default function Home() {
  const [homeCatalog, setHomeCatalog] = useState<HomeCatalog | null>(null);

  useEffect(() => {
    const homePageCatalog = async () => {
      const data = await getHomePage();
      setHomeCatalog(data.data);
    };

    homePageCatalog();
  }, []);

  return (
    <div className="home-page">
      <div className="home-page__content">
        <section className="home-page__header">
          <Preview catalog={homeCatalog?.spotlight || []} />
        </section>
        <section className="home-page__main">
          <div className="home-page__cards">
            <AnimeSection
              title="Latest Completed"
              catalog={homeCatalog?.latestCompleted || []}
            />
            <AnimeSection
              title="Trending Anime"
              catalog={homeCatalog?.trending || []}
            />
          </div>
        </section>
        {/* <SideBar /> */}
      </div>
    </div>
  );
}
