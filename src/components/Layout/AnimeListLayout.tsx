import './AnimeListLayout.scss';
import './anime-card-feed.scss';
import { titleRefactor } from '@/shared/utils/title-refactor';

type props = {
  title?: string;
  children: React.ReactNode;
};

export const AnimeListLayout = ({ children, title }: props) => {
  return (
    <div className="mx-auto mt-20 flex w-full max-w-[2800px] flex-col gap-8 px-4 md:px-6 lg:px-10">
      {title && (
        <h1 className="text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          {`${titleRefactor(title)} Page`}
        </h1>
      )}
      <div className="anime-card-feed">{children}</div>
    </div>
  );
};
