"use client";
import { SkeletonNavbar } from "@/components/Skeleton/SkeletonNavbar/SkeletonNavbar";
import "./Header.scss";
import dynamic from "next/dynamic";


const LazyNavbar = dynamic(() => import("../Navbar/Navbar").then(mod => mod.Navbar), {
  ssr: false,
  loading: () => <SkeletonNavbar />,
});

export const Header = () => {
  return (
    <header className="header">
      <LazyNavbar />
    </header>
  );
};
