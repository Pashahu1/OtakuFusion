import { EpisodesType } from "@/types/EpisodesListType";
import "./EpisodesButton.scss";

type Props = {
  episode: EpisodesType;
  onSelected: (id: string) => void;
  selected: string;
};

export const EpisodesButton = ({ episode, onSelected, selected }: Props) => {
  const isActive = episode.episodeId === selected;

  const handleClick = () => {
    if (isActive) return;
    onSelected(episode.episodeId);
  };

  return (
    <div className="episodes-button-wrapper">
      <button
        onClick={handleClick}
        data-episode-number={episode.number}
        className={`episodes-button ${isActive ? "episodes-button--active" : ""}`}
      >
        {episode.isFiller && <span className="episodes-button__filler">F</span>}
        {episode.number}
      </button>
      <span className="episodes-button--hover">{episode.title}</span>
    </div>
  );
};
