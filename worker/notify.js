function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function buildText(payload) {
  if (payload.kind === 'yes') {
    return `💛 ¡Dijo que SÍ! 🎉\nCuándo: ${payload.cuando}\nHora: ${payload.hora}`
  }
  if (payload.kind === 'no') {
    return '💔 Dijo que no… fue definitivo.'
  }
  return null
}

export default {
  async fetch(request, env) {
    const headers = cors(env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers })
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return new Response('Bad JSON', { status: 400, headers })
    }

    const text = buildText(payload)
    if (!text) return new Response('Unknown kind', { status: 400, headers })

    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  },
}
