'use client';

import { useId } from 'react';
import type { SVGAttributes } from 'react';

interface VerifiedSealIconProps extends SVGAttributes<SVGSVGElement> {
  title?: string;
}

/** Eight-point seal with a punched-out checkmark (reference: verified burst icon). */
export function VerifiedSealIcon({
  title = 'Email verified',
  className,
  ...rest
}: VerifiedSealIconProps) {
  const rawId = useId().replace(/:/g, '');
  const maskId = `verified-check-mask-${rawId}`;

  const starPath =
    'M12 1 L13.99 7.196 L19.778 4.222 L16.804 10.01 L23 12 L16.804 13.99 L19.778 19.778 L13.99 16.804 12 23 L10.01 16.804 4.222 19.778 7.196 13.99 1 12 L7.196 10.01 4.222 4.222 10.01 7.196 Z';

  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...(title ? { title } : {})}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
        >
          <rect width="24" height="24" fill="white" />
          <path
            d="M7.95 11.92 L11.05 14.93 L17.94 8.04"
            fill="none"
            stroke="black"
            strokeWidth="3.05"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <path
        fill="currentColor"
        mask={`url(#${maskId})`}
        d={starPath}
      />
    </svg>
  );
}
