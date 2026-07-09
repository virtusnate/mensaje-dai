// Sends the outcome straight to Telegram from the browser (Telegram allows CORS).
//
// ⚠️ SECURITY: the bot token is read from a VITE_ env var, which means it is BAKED INTO THE
// PUBLIC BUNDLE and readable by anyone who opens the deployed site. Only acceptable for a
// private, disposable bot. For a real secret you'd keep a server/worker in front of Telegram.
let sent = new Set()

export function __resetNotify() {
  sent = new Set()
}

const TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

function buildText(payload) {
  if (payload.kind === 'yes') {
    return `💛 ¡Dijo que SÍ! 🎉\nCuándo: ${payload.cuando}\nHora: ${payload.hora}`
  }
  if (payload.kind === 'no') {
    return '💔 Dijo que no… fue definitivo.'
  }
  return null
}

export async function notify(payload) {
  if (sent.has(payload.kind)) return
  sent.add(payload.kind)

  const text = buildText(payload)
  if (!text || !TOKEN || !CHAT_ID) return

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text }),
  }
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`

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
