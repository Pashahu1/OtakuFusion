import { AZFilter } from "../AZFilter/AZFilter";
import "./ControlPanel.scss";

export const ControlPanel = () => {
  return (
    <div className="control-panel">
      <div className="control-panel__content">
        <AZFilter />
      </div>
    </div>
  );
};
