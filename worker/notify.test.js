import { describe, it, expect, vi, beforeEach } from 'vitest'
import worker from './notify'

const ENV = {
  TELEGRAM_BOT_TOKEN: 'TESTTOKEN',
  TELEGRAM_CHAT_ID: '1192867136',
  ALLOWED_ORIGIN: 'https://natan.gitlab.io',
}

function req(body, method = 'POST') {
  return new Request('https://w/notify', {
    method,
    headers: { 'Content-Type': 'application/json', Origin: ENV.ALLOWED_ORIGIN },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('worker notify', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
  })

  it('answers CORS preflight (OPTIONS)', async () => {
    const res = await worker.fetch(req(null, 'OPTIONS'), ENV)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ENV.ALLOWED_ORIGIN)
  })

  it('sends a YES summary to Telegram', async () => {
    const res = await worker.fetch(req({ kind: 'yes', cuando: 'Este Sábado', hora: '3 pm' }), ENV)
    expect(res.status).toBe(200)
    const url = fetch.mock.calls[0][0]
    const opts = fetch.mock.calls[0][1]
    expect(url).toBe('https://api.telegram.org/botTESTTOKEN/sendMessage')
    const sent = JSON.parse(opts.body)
    expect(sent.chat_id).toBe('1192867136')
    expect(sent.text).toContain('SÍ')
    expect(sent.text).toContain('Este Sábado')
    expect(sent.text).toContain('3 pm')
  })

  it('sends the definitivo message for kind=no', async () => {
    await worker.fetch(req({ kind: 'no' }), ENV)
    const sent = JSON.parse(fetch.mock.calls[0][1].body)
    expect(sent.text).toContain('no')
  })

  it('rejects an unknown kind with 400', async () => {
    const res = await worker.fetch(req({ kind: 'maybe' }), ENV)
    expect(res.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })
})
