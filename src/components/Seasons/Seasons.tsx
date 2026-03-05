"use client";
import type { SeasonsTypes } from "../../shared/types/GlobalAnimeTypes";
import Link from "next/link";
import { usePathname } from "next/navigation";

type props = {
  seasons: SeasonsTypes[];
};

export const Seasons: React.FC<props> = ({ seasons }) => {
  const pathname = usePathname();
  const currentId = pathname.split("/").pop();

  return (
    <div className="grid w-full max-w-full grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {seasons?.map((item) => {
        const isCurrent = item.id === currentId;

        return (
          <Link
            href={`/watch/${item.id}`}
            className={`relative flex min-h-[100px] w-full min-w-0 overflow-hidden rounded-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg ${
              isCurrent
                ? "border-2 border-[#f47521] text-[#f47521]"
                : "border border-white/10 hover:border-white/25"
            }`}
            key={item.id}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[3px]"
              style={{
                backgroundImage: `url('${item.season_poster}')`,
              }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/50" aria-hidden />
            <h4 className="relative z-10 flex min-h-[100px] flex-1 items-center justify-center p-4 text-center text-sm font-medium leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-base">
              {item.title}
            </h4>
          </Link>
        );
      })}
    </div>
  );
};
