export const ReplaceServerName = (name: string) => {
  if (!name) {
    return;
  }
  const n = name.toLocaleLowerCase();
  let title = "";

  if (n === "hd-2") {
    title = "VidStreaming";
  } else if (n === "hd-1") {
    title = "DouVideo";
  } else if (n === "hd-3") {
    title = "VidCloud";
  }

  return title;
};
