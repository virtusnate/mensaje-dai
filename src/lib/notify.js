let sent = new Set()

export function __resetNotify() {
  sent = new Set()
}

export async function notify(payload) {
  if (sent.has(payload.kind)) return
  sent.add(payload.kind)

  const url = import.meta.env.VITE_NOTIFY_URL
  if (!url) return

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }

  try {
    await fetch(url, options)
  } catch {
    try {
      await fetch(url, options)
    } catch {
      // fail silently — never block her experience
    }
  }
}
