"use client";
import { useState, useEffect } from "react";
import Hls from "hls.js";
import { getVideoSources } from "../../services/getVideoSources";

const VideoPlayer = ({
  animeEpisodeId,
  category,
}: {
  animeEpisodeId: string;
  category: string;
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchVideoSources = async () => {
      setIsLoading(true);

      try {
        const server = "hd-2";
        const res = await getVideoSources(animeEpisodeId, server, category);

        if (res.success && res.data?.sources?.length) {
          const videoSource = res.data.sources[0].url;
          setVideoUrl(videoSource);
          setSubtitles(res.data.subtitles || []);
        }
      } catch (error) {
        console.error("Failed to fetch video sources", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoSources();
  }, [animeEpisodeId, category]);

  useEffect(() => {
    if (videoUrl && Hls.isSupported()) {
      const video = document.getElementById("video-player") as HTMLVideoElement;
      if (!video) return;

      const hls = new Hls();

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS.js: Manifest parsed");
      });

      return () => {
        hls.destroy();
      };
    }
  }, [videoUrl]);

  return (
    <div className="video-player">
      {isLoading ? (
        <p>Loading video...</p>
      ) : (
        <video id="video-player" controls>
          {subtitles.map((sub, index) => (
            <track
              key={index}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.lang}
              label={sub.lang}
            />
          ))}
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
