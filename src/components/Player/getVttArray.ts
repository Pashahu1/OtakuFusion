/** Single VTT thumbnail entry: start/end times, image URL, and optional dimension keys (e.g. w, h, x, y) */
export interface VttThumbItem {
  start: number;
  end: number;
  url: string;
  [key: string]: string | number;
}

function padEnd(
  str: string,
  targetLength: number,
  padString: string
): string {
  if (str.length >= targetLength) {
    return String(str);
  }
  const padLength = targetLength - str.length;
  const padded =
    padString.length >= padLength
      ? padString.slice(0, padLength)
      : padString.repeat(Math.ceil(padLength / padString.length)).slice(0, padLength);
  return String(str) + padded;
}

/** Parse VTT timestamp (e.g. "00:01:02.500") to seconds */
function t2d(time: string): number {
  const arr = time.split('.');
  const left = (arr[0] ?? '').split(':');
  const right = padEnd(arr[1] ?? '0', 3, '0');
  const ms = Number(right) / 1000;
  const h = Number(left[left.length - 3] ?? 0) * 3600;
  const m = Number(left[left.length - 2] ?? 0) * 60;
  const s = Number(left[left.length - 1] ?? 0);
  return h + m + s + ms;
}

const TIME_LINE_REGEX =
  /((?:[0-9]{2}:)?(?:[0-9]{2}:)?[0-9]{2}(?:.[0-9]{3})?)(?: ?--> ?)((?:[0-9]{2}:)?(?:[0-9]{2}:)?[0-9]{2}(?:.[0-9]{3})?)/;
const TEXT_REGEX = /(.*)#(\w{4})=(.*)/i;
const INDEX_LINE_REGEX = /^\d+$/;
const ABSOLUTE_URL_REGEX = /^\/|((https?|ftp|file):\/\/)/i;

/**
 * Fetches a VTT file and parses it into an array of thumbnail entries (start, end, url, and optional keys).
 */
export async function getVttArray(vttUrl: string = ''): Promise<VttThumbItem[]> {
  const response = await fetch(vttUrl);
  const vttString = await response.text();
  const lines = vttString.split(/\r?\n/).filter((item) => item.trim());
  const vttArray: VttThumbItem[] = [];

  const isWebVTTHeader = lines[0]?.trim().toUpperCase() === 'WEBVTT';
  let startIndex = 0;
  let increment = 2;

  if (!isWebVTTHeader && INDEX_LINE_REGEX.test(lines[0]?.trim() ?? '')) {
    increment = 3;
    startIndex = 1;
  } else if (isWebVTTHeader) {
    const indexLine = lines[1];
    if (indexLine && INDEX_LINE_REGEX.test(indexLine.trim())) {
      increment = 3;
      startIndex = 2;
    } else {
      startIndex = 1;
      increment = 2;
    }
  }

  for (let i = startIndex; i < lines.length; i += increment) {
    const time = lines[i];
    const text = lines[i + 1];
    if (!time || !text?.trim()) continue;

    const timeMatch = time.match(TIME_LINE_REGEX);
    if (!timeMatch) continue;

    const textMatch = text.match(TEXT_REGEX);
    if (!textMatch) continue;

    const start = Math.floor(t2d(timeMatch[1]));
    const end = Math.floor(t2d(timeMatch[2]));
    let url = (textMatch[1] ?? '').trim();
    if (!ABSOLUTE_URL_REGEX.test(url)) {
      const urlArr = vttUrl.split('/');
      urlArr.pop();
      urlArr.push(url);
      url = urlArr.join('/');
    }

    const result: VttThumbItem = { start, end, url };
    const keys = (textMatch[2] ?? '').split('');
    const values = (textMatch[3] ?? '').split(',');
    for (let j = 0; j < keys.length; j++) {
      result[keys[j]] = values[j] ?? '';
    }
    vttArray.push(result);
  }

  return vttArray;
}
