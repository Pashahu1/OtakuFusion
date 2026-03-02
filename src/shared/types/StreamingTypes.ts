import type { Segment } from "./VideoSegmentsTypes";

export interface StreamingData {
  streamingLink: StreamingType[];
  servers: ServersType[];
}

export type StreamingType = {
  id: number;
  type: "dub" | "sub";
  link: {
    file: string;
    type: string;
  };
  tracks: [
    {
      file: string;
      label: string;
      kind: string;
      default: boolean;
    }
  ];
  intro: Segment;
  outro: Segment;
  server: string;
}

export type ServersType ={
  type: string;
  data_id: number;
  server_id: number;
  server_name: string;
}
