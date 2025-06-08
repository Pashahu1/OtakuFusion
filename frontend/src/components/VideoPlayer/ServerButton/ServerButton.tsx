import "./ServerButton.scss";
type props = {
  selectedType: boolean;
  onClick: () => void;
  name: string;
};

export const ServerButton: React.FC<props> = ({
  selectedType,
  onClick,
  name,
}) => {
  return (
    <button
      className={`server-button ${selectedType ? "server-button--active" : ""}`}
      onClick={onClick}
    >
      {name}
    </button>
  );
};
