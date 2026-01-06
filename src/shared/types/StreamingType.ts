export interface StreamingData {
  streamingLink: StreamingType[];
  servers: ServersType[];
}

export interface StreamingType {
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
  intro: { end: number; start: number };
  outro: { end: number; start: number };
  server: string;
}

export interface ServersType {
  type: string;
  data_id: number;
  server_id: number;
  server_name: string;
}
