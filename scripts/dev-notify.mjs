// LOCAL-ONLY test relay: runs the real Cloudflare Worker (worker/notify.js) on a Node http
// server so you can test the Telegram flow before deploying. Secrets come from env vars — nothing
// secret is stored in this file.
//
// Run (bash):
//   TELEGRAM_BOT_TOKEN=xx\:yy TELEGRAM_CHAT_ID=1192867136 ALLOWED_ORIGIN=http://localhost:5173 \
//     node scripts/dev-notify.mjs
import worker from '../worker/notify.js'
import { createServer } from 'node:http'

const env = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
}
const PORT = Number(process.env.PORT || 8787)

createServer(async (req, res) => {
  try {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const body = chunks.length ? Buffer.concat(chunks) : undefined
    const request = new Request(`http://localhost:${PORT}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
    })
    const response = await worker.fetch(request, env)
    res.statusCode = response.status
    response.headers.forEach((v, k) => res.setHeader(k, v))
    res.end(await response.text())
  } catch (err) {
    res.statusCode = 500
    res.end(String(err))
  }
}).listen(PORT, () => {
  console.log(`dev-notify relay → http://localhost:${PORT}  (origin ${env.ALLOWED_ORIGIN})`)
  console.log(`secrets: token ${env.TELEGRAM_BOT_TOKEN ? 'SET' : 'MISSING'}, chat ${env.TELEGRAM_CHAT_ID || 'MISSING'}`)
})
