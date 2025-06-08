import "./PlayerButton.scss";

type props = {
  name: string;
};

export const PlayerButton = ({ name }: props) => {
  return <button className="player-button">{name}</button>;
};
