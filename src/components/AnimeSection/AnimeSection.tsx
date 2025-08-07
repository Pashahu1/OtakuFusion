import type { AnimeInfo } from "@/shared/types/GlobalTypes";
import { Card } from "../Card/Card";

type Props = {
  title: string;
  catalog: AnimeInfo[];
};

const AnimeSection = ({ title, catalog }: Props) => {
  return (
    <section className="flex flex-col gap-[20px]">
      {catalog.length > 0 && (
        <div className="flex flex-col gap-[20px]">
          <h2>
            {title}
          </h2>
          <div
            className="grid gap-[20px] grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))]
            md:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]
            lg:grid-cols-[repeat(auto-fit,_minmax(240px,_1fr))]"
          >
            {catalog.map((anime) => (
              <Card key={anime.id} anime={anime} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AnimeSection;
