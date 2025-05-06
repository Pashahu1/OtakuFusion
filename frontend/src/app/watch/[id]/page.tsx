'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import { getAnimeDetails } from '../../../../api/getAnimeDetails';
// import { AnimeResponse } from '../../../../types/AnimeInfoTypes';
export default function WatchPage() {
  // const [animeDetails, setAnimeDetails] = useState<AnimeResponse | null>(null);
  // const { id } = useParams() as { id: string };

  // useEffect(() => {
  //   const details = async () => {
  //     if (id) {
  //       const res = await getAnimeDetails(id);
  //       setAnimeDetails(res.data.anime);
  //       console.log(res.data.anime);
  //     }
  //   };
  //   details();
  // }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Аніме Плеер</h1>
      {/* <div></div> */}
    </div>
  );
}
