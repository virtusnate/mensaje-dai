import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// notify reads the token/chat at module load, so stub env then dynamic-import per test.
describe('notify', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_TELEGRAM_BOT_TOKEN', 'TESTTOKEN')
    vi.stubEnv('VITE_TELEGRAM_CHAT_ID', '999')
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })
  afterEach(() => vi.unstubAllEnvs())

  it('POSTs a YES summary to the Telegram sendMessage endpoint', async () => {
    const { notify } = await import('./notify')
    await notify({ kind: 'yes', cuando: 'Sábado', hora: '3 pm' })
    expect(fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botTESTTOKEN/sendMessage',
      expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
    )
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.chat_id).toBe('999')
    expect(body.text).toContain('SÍ')
    expect(body.text).toContain('Sábado')
    expect(body.text).toContain('3 pm')
  })

  it('sends the same kind only once per session', async () => {
    const { notify } = await import('./notify')
    await notify({ kind: 'no' })
    await notify({ kind: 'no' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not call fetch for an unknown kind', async () => {
    const { notify } = await import('./notify')
    await notify({ kind: 'maybe' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('retries once on failure then resolves without throwing', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ ok: true })
    const { notify } = await import('./notify')
    await expect(notify({ kind: 'yes', cuando: 'X', hora: 'Y' })).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
