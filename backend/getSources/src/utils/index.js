export function getUrl(input, fallbackUrl) {
  try {
    return new URL(input)
  } catch (e) {
    const pathname = input.startsWith('/') ? input.substring(1) : input
    const pathnames = fallbackUrl.pathname.split('/')
    pathnames[pathnames.length - 1] = pathname

    fallbackUrl.pathname = pathnames.join('/')
    return fallbackUrl
  }
}
