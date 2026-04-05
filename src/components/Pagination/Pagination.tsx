'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import './Pagination.scss';

type PaginationProps = {
  pageCount: number;
  currentPage: number;
};

function computeVisiblePageIndices(
  pageCount: number,
  selectedZeroBased: number,
  pageRangeDisplayed: number,
  marginPagesDisplayed: number
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
    selectedZeroBased === 0 && pageRangeDisplayed > 1
      ? rightSide - 1
      : rightSide;

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

const PAGE_RANGE = 3;
const MARGIN_PAGES = 2;

export function Pagination({ pageCount = 0, currentPage = 1 }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedZeroBased = Math.max(0, Math.min(currentPage - 1, pageCount - 1));

  const hrefForPage = useCallback(
    (page1Based: number) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('page', String(page1Based));
      const q = next.toString();
      return q ? `${pathname}?${q}` : pathname;
    },
    [pathname, searchParams]
  );

  const pushPage = useCallback(
    (page1Based: number) => {
      router.push(hrefForPage(page1Based));
    },
    [hrefForPage, router]
  );

  const slots = useMemo(
    () =>
      computeVisiblePageIndices(
        pageCount,
        selectedZeroBased,
        PAGE_RANGE,
        MARGIN_PAGES
      ),
    [pageCount, selectedZeroBased]
  );

  if (pageCount === 0) return null;

  const isPreviousDisabled = selectedZeroBased <= 0;
  const isNextDisabled = selectedZeroBased >= pageCount - 1;

  return (
    <nav aria-label="Pagination" className="pagination-nav">
      <ul className="pagination">
        <li
          className={cn('previous', isPreviousDisabled && 'disabled')}
        >
          <a
            className={cn(isPreviousDisabled && 'disabled')}
            role="button"
            href={
              isPreviousDisabled ? undefined : hrefForPage(selectedZeroBased)
            }
            tabIndex={isPreviousDisabled ? -1 : 0}
            aria-disabled={isPreviousDisabled ? 'true' : 'false'}
            aria-label="Previous page"
            onClick={(e) => {
              e.preventDefault();
              if (!isPreviousDisabled) pushPage(selectedZeroBased);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isPreviousDisabled) pushPage(selectedZeroBased);
              }
            }}
          >
            &lt;
          </a>
        </li>

        {slots.map((slot, i) =>
          slot === null ? (
            <li key={`ellipsis-${i}`} className="break" aria-hidden>
              <span className="pagination__ellipsis">…</span>
            </li>
          ) : (
            <li
              key={slot}
              className={cn(slot === selectedZeroBased && 'active')}
            >
              <a
                role="button"
                href={hrefForPage(slot + 1)}
                tabIndex={slot === selectedZeroBased ? -1 : 0}
                aria-label={
                  slot === selectedZeroBased
                    ? `Page ${slot + 1} is your current page`
                    : `Go to page ${slot + 1}`
                }
                aria-current={slot === selectedZeroBased ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  if (slot !== selectedZeroBased) pushPage(slot + 1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (slot !== selectedZeroBased) pushPage(slot + 1);
                  }
                }}
              >
                {slot + 1}
              </a>
            </li>
          )
        )}

        <li className={cn('next', isNextDisabled && 'disabled')}>
          <a
            className={cn(isNextDisabled && 'disabled')}
            role="button"
            href={
              isNextDisabled ? undefined : hrefForPage(selectedZeroBased + 2)
            }
            tabIndex={isNextDisabled ? -1 : 0}
            aria-disabled={isNextDisabled ? 'true' : 'false'}
            aria-label="Next page"
            onClick={(e) => {
              e.preventDefault();
              if (!isNextDisabled) pushPage(selectedZeroBased + 2);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isNextDisabled) pushPage(selectedZeroBased + 2);
              }
            }}
          >
            &gt;
          </a>
        </li>
      </ul>
    </nav>
  );
}
