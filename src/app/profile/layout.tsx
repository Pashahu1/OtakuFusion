type LayoutProfileType = {
  children: React.ReactNode;
};

export default function LayoutProfile({ children }: LayoutProfileType) {
  return (
    <div className="mx-auto mt-[80px] flex w-full max-w-xl items-center justify-center px-4 py-8 sm:px-6">
      {children}
    </div>
  );
}
