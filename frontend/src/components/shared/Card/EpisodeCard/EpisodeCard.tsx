export const EpisodesCard = ({ episode }: any) => {
  return (
    <button
      data-episode-number={episode.number}
      style={{ background: "#363636", width: "60px", height: "40px" }}
    >
      {episode.number}
    </button>
  );
};
