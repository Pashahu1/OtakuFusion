export const HandleTextSliced = (text: string) => {
  const res = text.split(" ").slice(0, 70).join(" ");
  return res;
};
