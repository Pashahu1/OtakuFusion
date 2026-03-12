import { getChapterStyles } from '@/components/Player/getChapterStyle';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import { useEffect } from 'react';

export function useChapterStyles(streamUrl: string | null, intro: Segment | null, outro: Segment | null) {
  useEffect(() => {
    const applyChapterStyles = () => {
      const existingStyles = document.querySelectorAll(
        'style[data-chapter-styles]'
      );
      existingStyles.forEach((style) => style.remove());
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-chapter-styles', 'true');
      const styles = getChapterStyles(intro, outro);
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
      return () => {
        styleElement.remove();
      };
    };

    if (streamUrl || intro || outro) {
      const cleanup = applyChapterStyles();
      return cleanup;
    }
  }, [streamUrl, intro, outro]);
}
