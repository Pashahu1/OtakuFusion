import {
  faClosedCaptioning,
  faFile,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BouncingLoader } from '@/components/ui/Bouncingloader/Bouncingloader';
import { useEffect } from 'react';
import type { Season } from '@/shared/types/AnimeServersTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

function Servers({
  servers,
  activeEpisodeNum,
  activeServerId,
  setActiveServerId,
  serverLoading,
}: Season) {
  const subServers = servers?.filter((server) => server.type === 'sub') || [];
  const dubServers = servers?.filter((server) => server.type === 'dub') || [];
  const rawServers = servers?.filter((server) => server.type === 'raw') || [];

  useEffect(() => {
    if (!servers || !servers.length || activeServerId) return;

    const savedServerName = localStorage.getItem('server_name');

    if (savedServerName) {
      const matchingServer = servers?.find(
        (server) => server.serverName === savedServerName
      );

      if (matchingServer) {
        setActiveServerId(String(matchingServer.data_id));
      } else if (servers && servers.length > 0) {
        setActiveServerId(String(servers[0].data_id));
      }
    } else if (servers && servers.length > 0) {
      setActiveServerId(String(servers[0].data_id));
    }
  }, [servers]);

  const handleServerSelect = (server: ServerInfo) => {
    setActiveServerId(String(server.data_id));
    localStorage.setItem('server_name', server.serverName);
    localStorage.setItem('server_type', server.type);
  };

  const handleRenameServer = (server: ServerInfo) => {
    if (server.serverName === 'HD-1') {
      return 'Japanese';
    } else if (server.serverName === 'HD-2') {
      return 'English';
    }
  };

  return (
    <div className="relative bg-[#23252b] p-4 w-full min-h-[330px] flex justify-center items-center max-[1200px]:bg-[#23252b]">
      {serverLoading ? (
        <div className="w-full h-full rounded-lg flex justify-center items-center max-[600px]:rounded-none">
          <BouncingLoader />
        </div>
      ) : servers ? (
        <div className="w-full h-full rounded-lg grid grid-cols-[minmax(0,30%), minmax(0,70%)] overflow-hidden max-[800px]:grid-cols-[minmax(0,40%),minmax(0,60%)] max-[600px]:flex max-[600px]:flex-col max-[600px]:rounded-none">
          <div className="h-full bg-[#23252b] p-4 text-white flex flex-col justify-center items-center gap-y-2 max-[600px]:bg-transparent max-[600px]:h-1/2 max-[600px]:text-white max-[600px]:mb-4">
            <p className="text-center leading-5 font-medium text-[14px] text-[#cfcfcf]">
              You are watching <br />
              <span className="font-bold text-[#ff640a] drop-shadow-[0_0_4px_rgba(255,100,10,0.6)]">
                Episode {activeEpisodeNum}
              </span>
            </p>
            <p className="leading-5 text-[14px] font-medium text-center">
              If the current server doesn&apos;t work, please try other servers
              StreamCore or others beside.
            </p>
          </div>
          <div className="flex flex-col max-[600px]:h-full">
            {rawServers.length > 0 && (
              <div
                className={`servers flex h-full flex-wrap items-center border-b border-dashed border-[#35373d] p-3 last:border-b-0 max-[600px]:py-3 ${
                  dubServers.length === 0 || subServers.length === 0
                    ? 'h-1/2'
                    : 'h-full'
                }`}
              >
                <div className="flex w-full items-center gap-x-2 max-[600px]:mb-2 sm:mb-0 sm:w-auto">
                  <FontAwesomeIcon icon={faFile} className="text-[#ff640a] text-sm" />
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#ff640a] opacity-90">
                    RAW SERVERS:
                  </p>
                </div>
                <div className="ml-0 flex flex-wrap gap-2 sm:ml-6">
                  {rawServers.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`min-h-[40px] rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
                        activeServerId === String(item?.data_id)
                          ? 'bg-[#ff640a] text-black shadow-[0_0_10px_rgba(255,100,10,0.4)] scale-[1.02]'
                          : 'border border-[#3a3c45] bg-[#2d2f36] text-[#e5e5e5] hover:border-[#ff640a] hover:text-[#ff640a]'
                      }`}
                      onClick={() => handleServerSelect(item)}
                    >
                      {handleRenameServer(item) ?? item.serverName}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {subServers.length > 0 && (
              <div
                className={`servers flex h-full flex-wrap items-center border-b border-dashed border-[#35373d] p-3 last:border-b-0 max-[600px]:py-3 ${
                  dubServers.length === 0 ? 'h-1/2' : 'h-full'
                }`}
              >
                <div className="flex w-full items-center gap-x-2 max-[600px]:mb-2 sm:mb-0 sm:w-auto">
                  <FontAwesomeIcon icon={faClosedCaptioning} className="text-[#ff640a] text-sm" />
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#ff640a] opacity-90">
                    SUB SERVERS:
                  </p>
                </div>
                <div className="ml-0 flex flex-wrap gap-2 sm:ml-6">
                  {subServers.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`min-h-[40px] rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
                        activeServerId === String(item?.data_id)
                          ? 'bg-[#ff640a] text-black shadow-[0_0_10px_rgba(255,100,10,0.4)] scale-[1.02]'
                          : 'border border-[#3a3c45] bg-[#2d2f36] text-[#e5e5e5] hover:border-[#ff640a] hover:text-[#ff640a]'
                      }`}
                      onClick={() => handleServerSelect(item)}
                    >
                      {handleRenameServer(item) ?? item.serverName}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {dubServers.length > 0 && (
              <div
                className={`servers flex h-full flex-wrap items-center border-b border-dashed border-[#35373d] p-3 last:border-b-0 max-[600px]:py-3 ${
                  subServers.length === 0 ? 'h-1/2' : 'h-full'
                }`}
              >
                <div className="flex w-full items-center gap-x-2 max-[600px]:mb-2 sm:mb-0 sm:w-auto">
                  <FontAwesomeIcon icon={faMicrophone} className="text-[#ff640a] text-sm" />
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#ff640a] opacity-90">
                    DUB SERVERS:
                  </p>
                </div>
                <div className="ml-0 flex flex-wrap gap-2 sm:ml-6">
                  {dubServers.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`min-h-[40px] rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
                        activeServerId === String(item?.data_id)
                          ? 'bg-[#ff640a] text-black shadow-[0_0_10px_rgba(255,100,10,0.4)] scale-[1.02]'
                          : 'border border-[#3a3c45] bg-[#2d2f36] text-[#e5e5e5] hover:border-[#ff640a] hover:text-[#ff640a]'
                      }`}
                      onClick={() => handleServerSelect(item)}
                    >
                      {handleRenameServer(item) ?? item.serverName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center font-medium text-[15px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          Could not load servers <br />
          Either reload or try again after sometime
        </p>
      )}
    </div>
  );
}

export default Servers;
