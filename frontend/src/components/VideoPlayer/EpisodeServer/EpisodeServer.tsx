import { AnimeServerType } from "@/types/AnimeServer";
import "./EpisodeServer.scss";
import { ServerButton } from "../ServerButton/ServerButton";
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
    <div className="episode-server-grid">
      <div className="episode-server-column">
        <h3>SUB:</h3>
        {subHd2 && (
          <ServerButton
            className={`server-button ${
              selectedServer.type === "sub" ? "server-button--active" : ""
            }`}
            onClick={() => onServerSelect({ type: "sub", serverName: "hd-2" })}
            name="Vildstreaming"
          />
        )}
      </div>

      <div className="episode-server-column">
        <h3>DUB:</h3>
        {dubHd2 && (
          <ServerButton
            className={`server-button ${
              selectedServer.type === "dub" ? "server-button--active" : ""
            }`}
            onClick={() => onServerSelect({ type: "dub", serverName: "hd-2" })}
            name="Vildstreaming"
          />
        )}
      </div>
    </div>
  );
};
