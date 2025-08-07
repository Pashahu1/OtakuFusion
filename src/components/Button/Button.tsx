import type { ReactNode } from "react";
type Props = {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export const Button = ({ className, children, onClick, type }: Props) => {
  return (
    <button
      className={`
        flex items-center justify-center
        w-[100%] h-[40px]
        rounded-[3px]
        bg-[#f47521]
        text-[#2a2a2a]
        text-[18px] font-medium
        cursor-pointer
        group
        lg:hover:bg-[#2a2a2a]
        lg:hover:text-[#f47521]
        ${className}
      `}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};
