export function computeVisiblePageIndices(
  pageCount: number,
  selectedZeroBased: number,
  pageRangeDisplayed: number,
  marginPagesDisplayed: number,
): Array<number | null> {
  if (pageCount <= 0) return [];
  if (pageCount <= pageRangeDisplayed) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  let leftSide = pageRangeDisplayed / 2;
  let rightSide = pageRangeDisplayed - leftSide;

  if (selectedZeroBased > pageCount - pageRangeDisplayed / 2) {
    rightSide = pageCount - selectedZeroBased;
    leftSide = pageRangeDisplayed - rightSide;
  } else if (selectedZeroBased < pageRangeDisplayed / 2) {
    leftSide = selectedZeroBased;
    rightSide = pageRangeDisplayed - leftSide;
  }

  const adjustedRightSide =
    selectedZeroBased === 0 && pageRangeDisplayed > 1 ? rightSide - 1 : rightSide;

  const show = new Set<number>();
  for (let index = 0; index < pageCount; index++) {
    const page = index + 1;
    if (page <= marginPagesDisplayed) {
      show.add(index);
      continue;
    }
    if (page > pageCount - marginPagesDisplayed) {
      show.add(index);
      continue;
    }
    if (
      index >= selectedZeroBased - leftSide &&
      index <= selectedZeroBased + adjustedRightSide
    ) {
      show.add(index);
    }
  }

  const sorted = [...show].sort((a, b) => a - b);
  const out: Array<number | null> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push(null);
    }
    out.push(sorted[i]);
  }
  return out;
}

export const PAGINATION_PAGE_RANGE = 3;
export const PAGINATION_MARGIN_PAGES = 2;
