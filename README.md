# Última Cita

Immersive storytelling gift app. React + Vite. Telegram notifications via a Cloudflare Worker.

## Local dev
1. `npm install`
2. Copy `.env.example` → `.env.local`, set `VITE_NOTIFY_URL` to your Worker URL.
3. `npm run dev`

## Worker (Telegram relay)
1. `npx wrangler login`
2. Set `ALLOWED_ORIGIN` in `wrangler.toml` to your GitLab Pages origin.
3. `npx wrangler secret put TELEGRAM_BOT_TOKEN`  (bot @dai_answer_bot token)
4. `npx wrangler secret put TELEGRAM_CHAT_ID`     (1192867136)
5. `npx wrangler deploy` → note the Worker URL → put it in `.env.local` and the GitLab CI/CD variable `VITE_NOTIFY_URL`.

## Deploy (GitLab Pages)
- Push to the default branch. The `pages` CI job builds and publishes `public/`.
- Set CI/CD variable `VITE_NOTIFY_URL` in GitLab project settings.
- Ensure `vite.config.js` `base` matches your Pages path (`/ultima-cita/` for a project page).
