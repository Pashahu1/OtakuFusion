import type Artplayer from 'artplayer';

/** Artplayer puts `aria-label` on `<i>` / `<div>` without roles — fix for Lighthouse ARIA audits. */
function patchArtplayerA11y(root: HTMLElement): void {
  for (const control of root.querySelectorAll<HTMLElement>('.art-control')) {
    const iconWithLabel = control.querySelector<HTMLElement>('.art-icon[aria-label]');
    if (iconWithLabel) {
      const label = iconWithLabel.getAttribute('aria-label');
      if (label && !control.hasAttribute('aria-label')) {
        control.setAttribute('aria-label', label);
      }
      iconWithLabel.removeAttribute('aria-label');
      iconWithLabel.setAttribute('aria-hidden', 'true');
    }

    if (control.tagName !== 'BUTTON' && !control.hasAttribute('role')) {
      control.setAttribute('role', 'button');
    }
  }

  for (const icon of root.querySelectorAll<HTMLElement>('.art-icon[aria-label]')) {
    if (icon.closest('.art-control')) continue;
    if (!icon.hasAttribute('role')) {
      icon.setAttribute('role', 'button');
    }
    if (!icon.hasAttribute('tabindex')) {
      icon.setAttribute('tabindex', '0');
    }
  }
}

export function attachPlayerA11y(art: Artplayer): () => void {
  const root = art.template.$player;
  if (!(root instanceof HTMLElement)) return () => {};

  patchArtplayerA11y(root);

  const observer = new MutationObserver(() => {
    patchArtplayerA11y(root);
  });

  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-label', 'class'],
  });

  return () => observer.disconnect();
}
