import { getUrl } from '../utils/index.js'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

const m3u8ContentTypes = [
  'application/vnd.',
  'application/x-mpegurl',
  'application/mpegurl',
  'application/vnd.apple.mpegurl',
  'audio/mpegurl',
  'audio/x-mpegurl',
  'video/x-mpegurl',
  'application/vnd.apple.mpegurl.audio',
  'application/vnd.apple.mpegurl.video',
]

export async function M3u8Proxy(req, res) {
  const scrapeUrlString = req.query.url
  const scrapeHeadersString = req.query.headers

  let scrapeHeadersObject = null
  if (scrapeHeadersString) {
    try {
      scrapeHeadersObject = JSON.parse(scrapeHeadersString)
    } catch (e) {
      console.log(e)
      console.log('[M3u8 Proxy V2] Malformed scrape headers, could not parse using DEFAULT headers')
      scrapeHeadersObject = null
    }
  }

  if (!scrapeUrlString) {
    return res.status(400).json({
      success: false,
      message: 'no scrape url provided',
    })
  }

  const scrapeUrl = new URL(scrapeUrlString)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...(typeof scrapeHeadersObject == 'object' ? scrapeHeadersObject : {}),
  }

  const rangeHeader = req.headers['range']
  if (rangeHeader) {
    headers['Range'] = rangeHeader
  }

  try {
    const response = await fetch(scrapeUrlString, { headers })

    // Check if the file is an m3u8 file by extension
    const isM3u8ByExtension = scrapeUrl.pathname.endsWith('.m3u8')

    // Determine the content type
    const responseContentType = response.headers.get('Content-Type')?.toLowerCase()

    // Check if it's an m3u8 file
    const isM3u8 =
      isM3u8ByExtension || m3u8ContentTypes.some((type) => responseContentType && responseContentType.includes(type))

    if (isM3u8) {
      let responseBody = await response.text() // Handle m3u8 as text
      const baseUrl = scrapeUrl.origin + scrapeUrl.pathname.substring(0, scrapeUrl.pathname.lastIndexOf('/') + 1)
      const m3u8FileChunks = responseBody.split('\n')
      const m3u8AdjustedChunks = []

      for (let line of m3u8FileChunks) {
        // Handle LANGUAGE="..." replacement (removing the third letter)
        if (line.includes('LANGUAGE="')) {
          line = line.replace(/LANGUAGE="([a-z]{3})"/i, (match, lang) => {
            // Custom mappings for specific languages
            const languageMappings = {
              spa: 'es',
              por: 'pt',
              pol: 'pl',
              tur: 'tr',
              rus: 'ru',
              ita: 'it',
            }
            const newLang = languageMappings[lang] || lang.slice(0, 2) // Use mapped or reduce to two characters
            return `LANGUAGE="${newLang}"`
          })
        }

        // Replace URI="..." for entries like #EXT-X-MEDIA
        if (line.includes('URI="')) {
          const uriMatch = line.match(/URI="([^"]+)"/)
          if (uriMatch) {
            const originalUri = uriMatch[1]
            const searchParams = new URLSearchParams()
            searchParams.set('url', originalUri)
            if (scrapeHeadersString) {
              searchParams.set('headers', scrapeHeadersString)
            }
            // Replace URI="..." with the adjusted /proxy URL
            line = line.replace(uriMatch[0], `URI="/proxy?${searchParams.toString()}"`)
          }
        }

        // Handle media URLs after #EXTINF, e.g., file names like 9758_000.jpg
        if (line.match(/\.(jpg|jpeg|png|mp4|ts|html|js)(\?.*)?$/i)) {
          const filename = line.trim()
          const fullUrl = baseUrl + filename

          const searchParams = new URLSearchParams()
          searchParams.set('url', fullUrl)
          if (scrapeHeadersString) searchParams.set('headers', scrapeHeadersString)

          // Replace filename with the proxy URL
          line = `/proxy?${searchParams.toString()}`
        }

        // Handle media URLs after #EXTINF
        if (line.startsWith('http')) {
          const url = getUrl(line, scrapeUrl)
          const searchParams = new URLSearchParams()
          searchParams.set('url', url.toString())
          if (scrapeHeadersString) searchParams.set('headers', scrapeHeadersString)

          // Replace media URLs with proxy
          line = `/proxy?${searchParams.toString()}`
        }

        // Add the modified or unmodified line back to the adjusted chunks
        m3u8AdjustedChunks.push(line)
      }

      // Join the adjusted content
      responseBody = m3u8AdjustedChunks.join('\n')

      // Set necessary headers for no-caching
      res.set('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
      res.status(response.status).send(responseBody)
    } else {
      // Pipe all other content types directly
      res.set('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')

      await pipelineAsync(response.body, res) // Pipe the response directly for non-m3u8 files
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error fetching data from scrape URL',
    })
  }
}
