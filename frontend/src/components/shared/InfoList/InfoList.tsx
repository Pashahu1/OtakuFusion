type props = {
  label: string;
  value: string | string[];
};

export const InfoList: React.FC<props> = ({ label, value }) => {
  return (
    <li className="more-info__item">
      <span>{label}:</span>
      <p>{value}</p>
    </li>
  );
};
