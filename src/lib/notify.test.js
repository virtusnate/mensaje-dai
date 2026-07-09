import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notify, __resetNotify } from './notify'

describe('notify', () => {
  beforeEach(() => {
    __resetNotify()
    vi.stubEnv('VITE_NOTIFY_URL', 'https://worker.example.com/notify')
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  it('POSTs the payload as JSON to the notify URL', async () => {
    await notify({ kind: 'yes', cuando: 'Sábado', hora: '3 pm' })
    expect(fetch).toHaveBeenCalledWith(
      'https://worker.example.com/notify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'yes', cuando: 'Sábado', hora: '3 pm' }),
      })
    )
  })

  it('sends the same kind only once per session (guard)', async () => {
    await notify({ kind: 'no' })
    await notify({ kind: 'no' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('allows different kinds', async () => {
    await notify({ kind: 'no' })
    await notify({ kind: 'yes', cuando: 'Lunes', hora: '1 pm' })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retries once on failure then resolves without throwing', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ ok: true })
    await expect(notify({ kind: 'yes', cuando: 'X', hora: 'Y' })).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
