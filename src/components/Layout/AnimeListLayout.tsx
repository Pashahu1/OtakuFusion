import './AnimeListLayout.scss';
import { TitleRefactor } from '@/helper/TitleRefactor';

type props = {
  title?: string;
  children: React.ReactNode;
};

export const AnimeListLayout = ({ children, title }: props) => {
  return (
    <div className="flex flex-col w-full max-w-[2400px] mx-auto mt-20 px-4 gap-8">
      {title && (
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">{`${TitleRefactor(title)} Page`}</h1>
      )}
      <div className="grid gap-5 w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:gap-6 lg:gap-8 auto-rows-fr">
        {children}
      </div>
    </div>
  );
};
