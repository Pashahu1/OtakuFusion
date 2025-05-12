// import { useEffect, useState } from "react";
// import { getQtipInfo } from "../../../../api/getQtipInfo";

// type props = {
//   animeId: string;
// };

// export const HoverCard: React.FC<props> = ({ animeId }) => {
//   const [animeInfo, setAnimeInfo] = useState<any | null>(null);

//   console.log(animeInfo);

//   useEffect(() => {
//     const fetchQtipInfo = async () => {
//       try {
//         const res = await getQtipInfo(animeId);
//         setAnimeInfo(res.data);
//       } catch {
//         console.log("failed fetch");
//       }
//     };
//     fetchQtipInfo();
//   }, [animeInfo]);

//   return <div className="anime-card--hover">{/* <p>{animeInfo.id}</p> */}</div>;
// };
