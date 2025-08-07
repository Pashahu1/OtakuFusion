"use client";
import { Button } from "@/components/Button/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col justify-center items-center h-[100vh] w-[100%]">
      <Image
        className="object-cover"
        fill
        src="/error-404.jpg"
        alt="error-404"
      />

      <Button
        className="w-[200px] h-[80px] px-[20px] z-1"
        onClick={handleClick}
        aria-label="Return to Home Page"
      >
        Press for return to Home page
      </Button>
    </div>
  );
}
