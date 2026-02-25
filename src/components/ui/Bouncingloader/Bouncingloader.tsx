export const BouncingLoader = () => {
  return (
    <div className="flex gap-[5px]">
      <div className="h-[18px] w-[18px] rounded-full bg-[#858490] animate-bounce [animation-delay:-0.32s]" />
      <div className="h-[18px] w-[18px] rounded-full bg-[#858490] animate-bounce [animation-delay:-0.16s]" />
      <div className="h-[18px] w-[18px] rounded-full bg-[#858490] animate-bounce" />
    </div>
  );
};

