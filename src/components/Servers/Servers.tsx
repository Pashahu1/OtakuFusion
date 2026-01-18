import {
  faClosedCaptioning,
  faFile,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BouncingLoader } from '@/components/ui/Bouncingloader/Bouncingloader';
import { useEffect } from 'react';
import './Servers.scss';
import type { AnimeServerType, Server } from '@/shared/types/AnimeServersType';

function Servers({
  servers,
  activeEpisodeNum,
  activeServerId,
  setActiveServerId,
  serverLoading,
}: AnimeServerType) {
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
        setActiveServerId(matchingServer.data_id);
      } else if (servers && servers.length > 0) {
        setActiveServerId(servers[0].data_id);
      }
    } else if (servers && servers.length > 0) {
      setActiveServerId(servers[0].data_id);
    }
  }, [servers]);

  const handleServerSelect = (server: Server) => {
    setActiveServerId(server.data_id);
    localStorage.setItem('server_name', server.serverName);
    localStorage.setItem('server_type', server.type);
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
            <p className="text-center leading-5 font-medium text-[14px]">
              You are watching <br />
              <span className="font-semibold max-[600px]:text-[#ff640a]">
                Episode {activeEpisodeNum}
              </span>
            </p>
            <p className="leading-5 text-[14px] font-medium text-center">
              If the current server doesn&apos;t work, please try other servers
              HD-2 or others beside.
            </p>
          </div>
          <div className="flex flex-col max-[600px]:h-full">
            {rawServers.length > 0 && (
              <div
                className={`servers p-2 flex items-center flex-wrap ml-2 max-[600px]:py-2 ${
                  dubServers.length === 0 || subServers.length === 0
                    ? 'h-1/2'
                    : 'h-full'
                }`}
              >
                <div className="flex items-center gap-x-2">
                  <FontAwesomeIcon
                    icon={faFile}
                    className="text-[#ff640a] text-[13px]"
                  />
                  <p className="font-bold text-[14px]">RAW:</p>
                </div>
                <div className="flex gap-x-[7px] ml-8 flex-wrap">
                  {rawServers.map((item, index) => (
                    <div
                      key={index}
                      className={`px-6 py-[5px] rounded-lg cursor-pointer ${
                        activeServerId === item?.data_id
                          ? 'bg-[#ff640a] text-black'
                          : 'bg-[#373646] text-white'
                      } max-[700px]:px-3`}
                      onClick={() => handleServerSelect(item)}
                    >
                      <p className="text-[13px] font-semibold">
                        {item.serverName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {subServers.length > 0 && (
              <div
                className={`servers p-2 flex items-center flex-wrap ml-2 max-[600px]:py-2 ${
                  dubServers.length === 0 ? 'h-1/2' : 'h-full'
                }`}
              >
                <div className="flex items-center gap-x-2">
                  <FontAwesomeIcon
                    icon={faClosedCaptioning}
                    className="text-[#ff640a] text-[13px]"
                  />
                  <p className="font-bold text-[14px]">SUB:</p>
                </div>
                <div className="flex gap-x-[7px] ml-8 flex-wrap">
                  {subServers.map((item, index) => (
                    <div
                      key={index}
                      className={`px-6 py-[5px] rounded-lg cursor-pointer ${
                        activeServerId === item?.data_id
                          ? 'bg-[#ff640a] text-black'
                          : 'bg-[#373646] text-white'
                      } max-[700px]:px-3`}
                      onClick={() => handleServerSelect(item)}
                    >
                      <p className="text-[13px] font-semibold">
                        {item.serverName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {dubServers.length > 0 && (
              <div
                className={`servers p-2 flex items-center flex-wrap ml-2 max-[600px]:py-2 ${
                  subServers.length === 0 ? 'h-1/2 ' : 'h-full'
                }`}
              >
                <div className="flex items-center gap-x-3">
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className="text-[#ff640a] text-[13px]"
                  />
                  <p className="font-bold text-[14px]">DUB:</p>
                </div>
                <div className="flex gap-x-[7px] ml-8 flex-wrap">
                  {dubServers.map((item, index) => (
                    <div
                      key={index}
                      className={`px-6 py-[5px] rounded-lg cursor-pointer ${
                        activeServerId === item?.data_id
                          ? 'bg-[#ff640a] text-black'
                          : 'bg-[#373646] text-white'
                      } max-[700px]:px-3`}
                      onClick={() => handleServerSelect(item)}
                    >
                      <p className="text-[13px] font-semibold">
                        {item.serverName}
                      </p>
                    </div>
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
