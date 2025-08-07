export function Convertor(url: string, resolution = "1366x768") {
  if (url.includes(resolution)) {
    return url.replace(/\/thumbnail\/\d+x\d+/, `/thumbnail/${resolution}`);
  }

  return url;
}
