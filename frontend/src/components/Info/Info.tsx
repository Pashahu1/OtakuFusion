import { InfoType } from "@/types/AnimeDetailsType";
import { InfoList } from "../shared/InfoList/InfoList";

type props = {
  info: InfoType;
};

export const Info: React.FC<props> = ({ info }) => {
  console.log(info.charactersVoiceActors);
  console.log(info.promotionalVideos);
  return (
    <div className="info">
      <h1>{info.name}</h1>
      <ul>
        <InfoList label="Type" value={info.stats.type} />
        {/* <InfoList
          label="CharactersVoiceActors" - must watch how to image this(array)
          value={.join(",")}
        />
        <InfoList
          label="PromotionalVideos" - must watch how to image this(array)
          value={.join(",")}
        /> */}
        <InfoList label="Duration" value={info.stats.duration} />
        <InfoList label="Rating" value={info.stats.rating} />
        <InfoList label="Quality" value={info.stats.quality} />
        {/* <InfoList
          label="Dub"
          value={
            info.stats.episodes.dub !== undefined
              ? info.stats.episodes.dub.toString() - optimizate this info.stats
              : "N/A"
          }
        />
        <InfoList
          label="Sub"
          value={
            info.stats.episodes.sub !== undefined
              ? info.stats.episodes.sub.toString() - optimizate this info.stats
              : "N/A"
          }
        /> */}
      </ul>
      <p>{info.description}</p>
    </div>
  );
};
