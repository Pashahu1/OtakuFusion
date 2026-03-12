export type Segment = {
  start: number;
  end: number;
};

export type Chapter = Segment & {
  title: string;
};
