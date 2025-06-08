import { AnimeServerType } from "@/types/AnimeServer";
import "./EpisodeServer.scss";
import { ServerButton } from "../ServerButton/ServerButton";
import { EpisodesList } from "../EpisodesList/EpisodesList";
type Props = {
  servers: AnimeServerType | null;
  onServerSelect: (server: { type: "sub" | "dub"; serverName: string }) => void;
  selectedServer: { type: "sub" | "dub"; serverName: string };
};

export const EpisodeServer: React.FC<Props> = ({
  servers,
  onServerSelect,
  selectedServer,
}) => {
  const subHd2 = servers?.sub?.find((s) => s.serverName === "hd-2");
  const dubHd2 = servers?.dub?.find((s) => s.serverName === "hd-2");

  return (
    <div className="episode-server">
      <div className="episode-server__content">
        {subHd2 && (
          <div className="server">
            <h3 style={{ width: "40px", height: "40px" }}>SUB:</h3>

            <ServerButton
              selectedType={selectedServer.type === "sub"}
              onClick={() =>
                onServerSelect({ type: "sub", serverName: "hd-2" })
              }
              name="Vildstreaming"
            />
          </div>
        )}
        {dubHd2 && (
          <div className="server">
            <h3 style={{ width: "40px", height: "40px" }}>DUB:</h3>

            <ServerButton
              selectedType={selectedServer.type === "dub"}
              onClick={() =>
                onServerSelect({ type: "dub", serverName: "hd-2" })
              }
              name="Vildstreaming"
            />
          </div>
        )}
      </div>
    </div>
  );
};
