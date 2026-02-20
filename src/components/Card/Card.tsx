import Link from 'next/link';
import Image from 'next/image';
import { Convertor } from '@/helper/Convertor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClosedCaptioning,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import type { AnimeInfo } from '../../shared/types/GlobalTypes';

type Props = {
  anime: AnimeInfo;
};

export const Card = ({ anime }: Props) => {
  return (
    <Link className="max-w-[280px]" href={`/watch/${anime.id}`}>
      <article className="group relative flex flex-col transition duration-300 w-full gap-[10px] hover:scale-[1.03] hover:shadow-lg">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md mb:w-[350px]">
          <Image
            src={anime.poster ? Convertor(anime.poster) : '/sukuna-error.jpg'}
            alt={anime.title}
            fill
            className="w-full object-cover object-center transition duration-300 group-hover:brightness-110"
          />

          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition duration-300" />

          <div className="absolute top-2 left-2 flex gap-1 z-10">
            {anime.tvInfo?.sub && (
              <div className="flex items-center gap-1 bg-brand-orange text-black px-2 py-[2px] rounded-[2px] text-[12px] font-bold">
                <FontAwesomeIcon
                  icon={faClosedCaptioning}
                  className="text-[12px] z-1 w-full max-w-[12px]"
                />
                {anime.tvInfo.sub}
              </div>
            )}

            {anime.tvInfo?.dub && (
              <div className="flex items-center gap-1 bg-[#B9E7FF] text-black px-2 py-[2px] rounded-[2px] text-[12px] font-bold">
                <FontAwesomeIcon icon={faMicrophone} className="z-1 text-[12px] w-full max-w-[12px]" />
                {anime.tvInfo.dub}
              </div>
            )}
            {anime?.adultContent && (
              <div className="flex items-center gap-1 bg-red-600 text-black px-2 py-[2px] rounded-[2px] text-[12px] font-bold">
                +18
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <h3 className="mt-2 text-sm font-medium text-brand-text-primary line-clamp-2">
          {anime.title}
        </h3>
      </article>
    </Link>
  );
};
