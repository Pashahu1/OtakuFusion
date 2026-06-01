'use client';

import { useEffect, useState } from 'react';

const FALLBACK_ACCENT = 'rgb(249 115 22 / 0.45)';
const FALLBACK_ACCENT_SOFT = 'rgb(249 115 22 / 0.12)';
const FALLBACK_BORDER = 'rgb(255 255 255 / 0.14)';

interface HeroImageAccent {
  borderColor: string;
  panelTint: string;
  accentColor: string;
}

function sampleImageAccent(url: string): Promise<HeroImageAccent | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 120) continue;
          r += data[i]!;
          g += data[i + 1]!;
          b += data[i + 2]!;
          count += 1;
        }

        if (count === 0) {
          resolve(null);
          return;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        resolve({
          borderColor: `rgb(${r} ${g} ${b} / 0.5)`,
          panelTint: `rgb(${r} ${g} ${b} / 0.08)`,
          accentColor: `rgb(${r} ${g} ${b})`,
        });
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function useHeroImageAccent(imageUrl: string | undefined): HeroImageAccent {
  const [accent, setAccent] = useState<HeroImageAccent>({
    borderColor: FALLBACK_BORDER,
    panelTint: FALLBACK_ACCENT_SOFT,
    accentColor: 'rgb(249 115 22)',
  });

  useEffect(() => {
    const url = imageUrl?.trim();
    if (!url) return;

    let cancelled = false;

    void sampleImageAccent(url).then((sampled) => {
      if (cancelled) return;
      if (sampled) {
        setAccent(sampled);
        return;
      }
      setAccent({
        borderColor: FALLBACK_ACCENT,
        panelTint: FALLBACK_ACCENT_SOFT,
        accentColor: 'rgb(249 115 22)',
      });
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return accent;
}
