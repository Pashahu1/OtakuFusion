type Props = {
  children: React.ReactNode;
};

export const WrapperLayout = ({ children }: Props) => {
  return <div className="mt-[60px] px-[20px]">{children}</div>;
};
