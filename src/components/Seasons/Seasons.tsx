"use client";
import type { SeasonsType } from "../../shared/types/GlobalTypes";
import Link from "next/link";
import "./Seasons.scss";
import { usePathname } from "next/navigation";
type props = {
  seasons: SeasonsType[];
};

export const Seasons: React.FC<props> = ({ seasons }) => {
  const pathname = usePathname();
  const currentId = pathname.split("/").pop();

  return (
    <div className="seasons">
      {seasons?.map((item) => {
        const isCurrent = item.id === currentId;

        return (
          <Link
            href={`/watch/${item.id}`}
            className={`seasons__category ${
              isCurrent ? "seasons__category--current" : ""
            }`}
            key={item.id}
          >
            <div
              style={{
                background: `url('${item.season_poster}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                objectFit: "cover",
                height: "78px",
                filter: `blur(3px)`,
              }}
            ></div>
            <h4
              className={`seasons__name ${
                isCurrent ? "seasons__category--current" : ""
              }`}
            >
              {item.title}
            </h4>
          </Link>
        );
      })}
    </div>
  );
};
