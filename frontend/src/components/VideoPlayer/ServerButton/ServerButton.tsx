type props = {
  className: string;
  onClick: () => void;
  name: string;
};

export const ServerButton: React.FC<props> = ({ className, onClick, name }) => {
  return (
    <button className={className} onClick={onClick}>
      {name}
    </button>
  );
};
