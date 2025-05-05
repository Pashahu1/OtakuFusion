"use client";
import { useEffect } from "react";
import { getHomePage } from "../../../api/getHomePage";
import "./HomePage.scss";
// import { AnimeSection } from "../../../components/shared/AnimeSection/AnimeSection";
// import { Preview } from "../../../components/Preview/Preview";
import { useSelector } from "react-redux";
import { useActions } from "../../../hooks/useActions";
import { RootState } from "../../../store/store";

export default function Home() {
  const { getHomeCatalog } = useActions();
  const homeCatalog = useSelector((state: RootState) => state.animeHomeCatalog);

  useEffect(() => {
    const homePageCatalog = async () => {
      const data = await getHomePage();
      getHomeCatalog(data.data);
    };

    homePageCatalog();
  }, []);

  console.log(homeCatalog)

  return (
    <div className="home-page">
      <div className="home-page__content">
        <section className="home-page__header">
          {/* <Preview /> */}
        </section>
        <section className="home-page__main">
          {/* <div className="home-page__cards">
            <AnimeSection
              title="Latest Completed"
              catalog={homeCatalog?.latestCompleted || []}
            />
            <AnimeSection
              title="Top Upcoming"
              catalog={homeCatalog?.topUpcoming || []}
            />
          </div> */}
        </section>
      </div>
    </div>
  );
}
