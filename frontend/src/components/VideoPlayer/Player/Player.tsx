"use client";
import { Ref } from "react";
import "./Player.scss";

type props = {
  videoRef: Ref<HTMLVideoElement> | undefined;
  selected: string;
};

const Player: React.FC<props> = ({ videoRef, selected }) => {
  return (
    <div className="player">
      <video key={selected} ref={videoRef} controls width={800} />
    </div>
  );
};

export default Player;
