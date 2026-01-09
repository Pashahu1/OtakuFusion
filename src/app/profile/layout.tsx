type LayoutProfileType = {
  children: React.ReactNode;
};

export default function LayoutProfile({ children }: LayoutProfileType) {
  return (
    <div className="flex item-center justify-center max-w-xl mx-auto px-4 py-8 mt-[80px]">
      {children}
    </div>
  );
}
