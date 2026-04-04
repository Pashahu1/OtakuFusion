import './AnimeListLayout.scss';
import { TitleRefactor } from '@/helper/TitleRefactor';

type props = {
  title?: string;
  children: React.ReactNode;
};

export const AnimeListLayout = ({ children, title }: props) => {
  return (
    <div className="mx-auto mt-20 flex w-full max-w-[2800px] flex-col gap-8 px-4 md:px-6 lg:px-10">
      {title && (
        <h1 className="text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          {`${TitleRefactor(title)} Page`}
        </h1>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 sm:gap-4 md:gap-5">
        {children}
      </div>
    </div>
  );
};
