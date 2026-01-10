import './AnimeListLayout.scss';
import { TitleRefactor } from '@/helper/TitleRefactor';

type props = {
  title?: string;
  children: React.ReactNode;
};

export const AnimeListLayout = ({ children, title }: props) => {
  return (
    <div className="flex flex-col w-full max-w-[2800px] mx-auto mt-20 gap-8 px-4 lg:px-10">
      {title && (
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">{`${TitleRefactor(title)} Page`}</h1>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-[20px]">
        {children}
      </div>
    </div>
  );
};
