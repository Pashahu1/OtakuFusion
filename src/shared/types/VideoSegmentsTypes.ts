export type Segment = {
  start: number;
  end: number;
};

/** Глава для плеєра (сегмент + назва, напр. intro/outro) */
export type Chapter = Segment & {
  title: string;
};
