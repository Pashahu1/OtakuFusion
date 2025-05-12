// import { Watch } from "../../components/Watch/Watch";

import VideoPlayer from "../components/Player/Player";

export default function Info() {
  return (
    <div>
      <h2>Please Registrate your Account</h2>
      {/* <Watch /> */}
      <VideoPlayer
        animeEpisodeId="steinsgate-3?ep=230"
        server="hd-1"
        category="dub"
      />
    </div>
  );
}
