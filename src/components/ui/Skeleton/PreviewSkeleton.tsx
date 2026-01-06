'use client';
import { AnimeSectionSkeleton } from './AnimeSectionSkeleton';

export function PreviewSkeleton() {
  return (
    <>
      <div className="relative w-full h-[1300px] bg-neutral-900 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />

        <div className="absolute top-[30%] flex flex-col gap-4 w-[60%] w-full px-4 md:px-6 lg:px-10">
          <div className="h-8 w-full bg-neutral-700 rounded-md animate-pulse md:w-[400px]" />
          <div className="h-60 w-full bg-neutral-700 rounded-md animate-pulse md:w-[800px]" />
          <div className="h-10 w-full bg-neutral-700 rounded-md animate-pulse md:w-[300px]" />
          <div className="h-4 w-full bg-neutral-700 rounded-md animate-pulse md:w-[400px]" />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-0 lg:mt-[-260px]">
        <div className="flex gap-4 overflow-hidden px-4">
          <AnimeSectionSkeleton title="Treanding" />
        </div>
      </div>
    </>
  );
}
