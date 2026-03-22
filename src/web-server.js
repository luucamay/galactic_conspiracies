import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const webRoot = path.resolve(__dirname, '../web')
const mobileRoot = path.join(webRoot, 'mobile')

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
}

function resolveRequestPath(urlPath) {
  const cleanPath = urlPath === '/' ? '/index.html' : urlPath
  const normalized = path.normalize(cleanPath).replace(/^\.\.(\/|\\|$)+/, '')
  return path.join(webRoot, normalized)
}

function resolveMobilePath(urlPath) {
  const relativeMobilePath = urlPath.replace(/^\/mobile/, '')
  const cleanPath = relativeMobilePath === '' || relativeMobilePath === '/' ? '/index.html' : relativeMobilePath
  const normalized = path.normalize(cleanPath).replace(/^\.\.(\/|\\|$)+/, '')
  return path.join(mobileRoot, normalized)
}

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', 'http://localhost')
    const isMobileRoute = requestUrl.pathname === '/mobile' || requestUrl.pathname.startsWith('/mobile/')
    let filePath = isMobileRoute ? resolveMobilePath(requestUrl.pathname) : resolveRequestPath(requestUrl.pathname)
    const ext = path.extname(filePath)
    let file

    try {
      file = await readFile(filePath)
    } catch {
      // Browser-router deep links under /mobile should always resolve to the SPA entrypoint.
      if (isMobileRoute) {
        filePath = path.join(mobileRoot, 'index.html')
        file = await readFile(filePath)
      } else {
        throw new Error('Not found')
      }
    }

    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    })
    res.end(file)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  }
})

const port = Number(process.env.PORT || 4173)
server.listen(port, () => {
  console.log(`GC frontend running at http://localhost:${port}`)
})
