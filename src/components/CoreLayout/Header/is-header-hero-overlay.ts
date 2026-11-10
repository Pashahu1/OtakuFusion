/** Home and series pages paint a hero under the 60px bar. Play hides the header. */
export function isHeaderHeroOverlayPath(pathname: string): boolean {
  return pathname === '/' || /^\/watch\/[^/]+$/.test(pathname);
}
