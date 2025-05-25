import { Season } from "@/types/AnimeDetailsType";
import Link from "next/link";

type props = {
  seasons: Season[];
};

export const Seasons: React.FC<props> = ({ seasons }) => {
  return (
    <div className="seasons">
      {seasons?.map((item) => (
        <Link
          href={`/watch/${item.id}`}
          className={`seasons__item rounded-md ${item.isCurrent && "border-2 border-pink-300 text-pink-300"}`}
          key={item.id}
        >
          <div
            style={{
              background: `url('${item.poster}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              objectFit: "cover",
              height: "78px",
              filter: `blur(3px)`,
            }}
          ></div>
          <h6 className={`seasons__name ${item.isCurrent && "text-pink-300"}`}>
            {item.name}
          </h6>
        </Link>
      ))}
    </div>
  );
};
