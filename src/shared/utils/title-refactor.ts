export function titleRefactor(title: string): string {
  if (title.includes('%%20')) {
    return title.replace(/%20/g, '-');
  }

  return title;
}
