export function Convertor(url: string, resolution = "1366x768") {
  return url.replace(/\/thumbnail\/\d+x\d+/, `/thumbnail/${resolution}`);
}
