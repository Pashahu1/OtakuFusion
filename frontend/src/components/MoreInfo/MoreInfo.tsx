import { MoreInfoType } from "@/types/AnimeDetailsType";
import "./MoreInfo.scss";
import { InfoList } from "../shared/InfoList/InfoList";

type props = {
  moreInfo: MoreInfoType;
};

export const MoreInfo: React.FC<props> = ({ moreInfo }) => {
  return (
    <div className="more-info">
      <ul className="more-info__list">
        <InfoList label="Aired" value={moreInfo?.aired} />
        <InfoList label="Duration" value={moreInfo?.duration} />
        <InfoList label="Japanese" value={moreInfo?.japanese} />
        <InfoList label="Malscore" value={moreInfo?.malscore} />
        <InfoList label="Premiered" value={moreInfo?.premiered} />
        {/* <InfoList
          label="Producers"
          value={moreInfo?.producers.join("," + " ")} - find solution for this one
        /> */}
        <InfoList label="Status" value={moreInfo?.status} />
        <InfoList label="Studios" value={moreInfo?.studios} />
        <InfoList label="Synonyms" value={moreInfo?.synonyms} />
      </ul>
    </div>
  );
};
