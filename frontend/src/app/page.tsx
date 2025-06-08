"use client";
import { useEffect, useState } from "react";
import { getHomePage } from "../services/getHomePage";
import "./HomePage.scss";
import { AnimeSection } from "../components/shared/AnimeSection/AnimeSection";
import { Preview } from "../components/Preview/Preview";
import { Loader } from "@/components/shared/Loader/Loader";
import { HomePageType } from "@/types/HomePageTypes";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [homeCatalog, setHomeCatalog] = useState<HomePageType | null>(null);

  useEffect(() => {
    const fetchHomePage = async () => {
      try {
        const res = await getHomePage();
        setHomeCatalog(res);
        setIsLoading(false);
      } catch {
        console.log("failed fetch");
        setIsLoading(true);
      }
    };
    fetchHomePage();
  }, []);

  return (
    <div className="home-page">
      {isLoading && <Loader />}

      {!isLoading && (
        <div className="home-page__content">
          <section className="home-page__header">
            <Preview homeCatalog={homeCatalog} />
          </section>
          {/* <section className="home-page__main">
            <div className="home-page__cards">
              <AnimeSection
                title="Latest Completed"
                catalog={homeCatalog?.topUpcomingAnimes || []}
              />
              <AnimeSection
                title="Top Upcoming"
                catalog={homeCatalog?.trendingAnimes || []}
              />
            </div>
          </section> */}
        </div>
      )}
    </div>
  );
}
