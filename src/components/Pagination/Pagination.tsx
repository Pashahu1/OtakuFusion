'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import './Pagination.scss';

import {
  computeVisiblePageIndices,
  PAGINATION_MARGIN_PAGES,
  PAGINATION_PAGE_RANGE,
} from './pagination/computeVisiblePageIndices';

type PaginationProps = {
  pageCount: number;
  currentPage: number;
};

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
    [pathname, searchParams],
  );

  const pushPage = useCallback(
    (page1Based: number) => {
      router.push(hrefForPage(page1Based));
    },
    [hrefForPage, router],
  );

  const slots = useMemo(
    () =>
      computeVisiblePageIndices(
        pageCount,
        selectedZeroBased,
        PAGINATION_PAGE_RANGE,
        PAGINATION_MARGIN_PAGES,
      ),
    [pageCount, selectedZeroBased],
  );

  if (pageCount === 0) return null;

  const isPreviousDisabled = selectedZeroBased <= 0;
  const isNextDisabled = selectedZeroBased >= pageCount - 1;

  return (
    <nav aria-label="Pagination" className="pagination-nav">
      <ul className="pagination">
        <li className={cn('previous', isPreviousDisabled && 'disabled')}>
          <a
            className={cn(isPreviousDisabled && 'disabled')}
            role="button"
            href={isPreviousDisabled ? undefined : hrefForPage(selectedZeroBased)}
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
            <li key={slot} className={cn(slot === selectedZeroBased && 'active')}>
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
          ),
        )}

        <li className={cn('next', isNextDisabled && 'disabled')}>
          <a
            className={cn(isNextDisabled && 'disabled')}
            role="button"
            href={isNextDisabled ? undefined : hrefForPage(selectedZeroBased + 2)}
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
