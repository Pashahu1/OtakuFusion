"use client";

import { ControlPanel } from "../../../components/ControlPanel/ControlPanel";
// import AZListPage from "./az-list/page";

export default function Animes() {
  return (
    <div className="animes">
      <div className="animes__content">
        <ControlPanel />
        {/* <AZListPage /> */}
      </div>
    </div>
  );
}
