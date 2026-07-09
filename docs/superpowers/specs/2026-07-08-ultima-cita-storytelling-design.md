# Última Cita — Linear Storytelling App · Design Spec

**Date:** 2026-07-08
**Working name:** `ultima-cita`
**Stack:** React + Vite + Tailwind (static SPA) · Cloudflare Worker (Telegram relay)
**Host:** GitLab Pages (app) + Cloudflare Worker (secure notification endpoint)
**Access:** Private link, shared with one recipient. No auth, no accounts.

---

## 1. Overview

A phone-first, immersive linear storytelling web app. It presents a personal letter one "beat" at a time. The reader taps to advance; with each tap a character walks a little further across a meadow and the scene warms from a melancholic twilight into a hopeful golden hour — the color mirrors the emotional arc of the text.

The story ends with a date invitation ("¿Quieres salir conmigo una vez más a la cineteca de Chapultepec?") and two branching outcomes:

- **Sí** → the character becomes joyful, two quick questions are asked, and a single summary is sent to the author via Telegram.
- **No** → repeated taps make the character progressively sadder and shrink the "No" button (while "Sí" grows), with two warnings, ending in the character "dying" and a definitive Telegram message — but a small "Sí" lingers so she can still change her mind.

Inspired by the visual craftsmanship of the earlier `nath-dai-album` project, but a distinct app with its own palette and purpose.

---

## 2. Design System

### Style
Immersive full-screen storytelling (VisionOS-adjacent depth + cinematic scene). Scroll/tap-triggered narrative with **progressive color reveal** — each beat shifts the palette, building emotional intensity from nostalgic → hopeful.

### Palette — "Golden Hour Meadow"
The background is a live gradient interpolated by reading progress `p` (0 → 1), from dusk to golden hour.

| Token | Hex | Usage |
|-------|-----|-------|
| `--dusk-top` | `#3E3355` | Twilight purple — sky top at `p=0` (nostalgic) |
| `--dusk-mid` | `#5A4A6A` | Sky mid at `p=0` |
| `--dusk-low` | `#7D6A72` | Horizon at `p=0` |
| `--gold-top` | `#F7D489` | Warm gold — sky top at `p=1` (hopeful) |
| `--gold-mid` | `#EFAC6A` | Sky mid at `p=1` |
| `--gold-low` | `#E08A5E` | Terracotta glow at horizon, `p=1` |
| `--meadow-light` | `#A7BD77` | Meadow grass (lit) |
| `--meadow-deep` | `#89A663` | Meadow grass (shadow) |
| `--hill-dusk` | `#40503F` | Hill silhouette at `p=0` |
| `--cream` | `#FBF3DE` | Primary text over dimmed/dark scenes |
| `--sepia` | `#4A2C14` | Text over bright golden scenes |
| `--coral` | `#E08A5E` | Primary CTA ("Sí" button) |
| `--muted-rose` | `#B06A68` | "No" button |
| `--scrim` | `rgba(20,14,30,0.35)` | Dim overlay behind floating text (legibility) |

Text color switches from `--cream` to `--sepia` once the background luminance passes a threshold (roughly `p > 0.6`) to keep contrast ≥ 4.5:1 at every beat.

### Typography
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Great+Vibes&display=swap');
```
| Role | Font | Notes |
|------|------|-------|
| Hero / the question / big emotional lines | **Great Vibes** | Romantic script, large sizes only |
| Body / letter beats / buttons / questions | **Cormorant Infant** | Elegant serif, 300–600 weights |

Great Vibes is decorative — never below ~28px and never for long paragraphs.

### Visual Effects
- **Ambient particles:** soft drifting motes / fireflies via **tsParticles**. Cool + sparse at `p=0`, warm + gentle + slightly denser toward `p=1`.
- **Scene depth:** layered parallax — sky, distant hills, meadow foreground — subtle movement as beats change.
- **Text entrance:** crossfade + gentle rise (translateY) between beats, 300ms ease-out.
- **Scrim:** semi-opaque gradient behind floating text so it stays legible over any scene.

---

## 3. Architecture

Single-page React app, no router. A small number of `useState`-driven "screens": `READING` → `QUESTION` → (`YES_FLOW` | `NO_ESCALATION` → `DEAD_END`).

```
ultima-cita/
├── index.html
├── vite.config.js                 ← base: '/ultima-cita/' for GitLab Pages
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example                   ← VITE_NOTIFY_URL (Cloudflare Worker URL)
├── .env.local                     ← actual worker URL (NOT committed)
├── worker/
│   └── notify.js                  ← Cloudflare Worker: holds bot token + chat id
├── src/
│   ├── main.jsx
│   ├── App.jsx                    ← screen state machine
│   ├── index.css                  ← fonts, tokens, base styles
│   ├── content/
│   │   └── story.js               ← THE LETTER, chunked into beats (source of truth)
│   ├── lib/
│   │   ├── progress.js            ← p (0..1) → interpolated colors, char position
│   │   └── notify.js              ← POST summary/definitivo to VITE_NOTIFY_URL
│   ├── hooks/
│   │   └── useReducedMotion.js    ← respects prefers-reduced-motion
│   └── components/
│       ├── Scene.jsx              ← gradient sky + hills + meadow, interpolated by p
│       ├── Particles.jsx          ← tsParticles wrapper, warmth tied to p
│       ├── Character.jsx          ← Lottie character; emotion prop (walk/sad/happy/dead)
│       ├── StoryText.jsx          ← floating beat text + scrim + tap-to-advance
│       ├── ProgressDots.jsx       ← subtle beat progress indicator
│       ├── QuestionScreen.jsx     ← the date invitation + Sí/No buttons
│       ├── NoEscalation.jsx       ← shrink/grow buttons, sadness stages, warnings, death
│       ├── WarningModal.jsx       ← "2 veces más…" / "Última oportunidad"
│       ├── YesFlow.jsx            ← two questionnaires + closing + heart
│       ├── QuestionCard.jsx       ← preset options + "Otro… ✎" write-in
│       └── HeartFinale.jsx        ← Lottie heart close animation
```

**No database.** The letter is static (baked into `content/story.js`). The only outbound data is the Telegram notification, fired through the Worker.

**Assumption (flagged):** the letter is fixed, so there is *no* text-input/upload UI. If an editable-text feature is wanted later, it's a separate iteration.

---

## 4. Story Content Model

`src/content/story.js` exports an ordered array of beats. Each beat is one tap. The character position and palette `p` are derived from `beatIndex / (totalBeats - 1)`.

```js
export const STORY = [
  "No me imaginaba que se podía querer tanto a alguien en tan poco tiempo, no concebía que iba a conocer a un ser tan espectacular que rompiera todos mis paradigmas sobre el amor que vivían tatuados en mí, no me esperaba lo mucho que sentiría tu ausencia una vez que decidieras que lo nuestro no iba a funcionar.",

  "No quiero que el paso del tiempo nuble todo lo que sentí por ti y sé que sentiste por mí, ese primer beso en el lugar menos romántico del mundo que me hizo sentir como si tú fueras todo mi universo y todo lo demás no importara, ese pensamiento de que ya no podía esperar más y tenía que descubrir el sabor de tus labios,",

  "Esa emoción al darme cuenta de que todos los rumores eran ciertos y besabas mejor que la propia diosa del amor, esa sensación cuando me sonreías después de una sesión romántica de beso tras beso, ese sentimiento cuando te veía a lo lejos antes de iniciar una cita y cómo te veía como la mujer más hermosa del mundo,",

  "Cómo sentía tu calor cuando nos abrazábamos viendo lo hermoso del museo Anahuacalli, esas pláticas profundas en las cafeterías que me permitían descubrir un poquito más de la persona que tanto me había fascinado, esas salidas a museos, el poder abrazarte mientras veíamos una película o dormíamos,",

  "Cuando me explicabas conceptos económicos o me hablabas sobre la flora de los lugares a donde íbamos, lo fácil que se sentía abrirme contigo y decirte pensamientos o sentimientos que nunca había compartido con nadie,",

  "Esa confianza de compartirme esos gustos que te avergonzarían si el gran público los supiera, la serotonina que me daba el ver un nuevo mensaje tuyo en mi celular y saber que aunque lejos seguías ahí para mí, todo eso y más estoy extrañando de ti.",

  "No lo voy a negar, no soy tan estoico como para aceptar que todo ya acabó y guardo en mi corazón la esperanza de que como una vez lo hiciste cambies de opinión una vez más, tengo fe de que me extrañes solo una fracción de lo que te estoy extrañando en este momento,",

  "Hay conexiones que simplemente no se pueden dejar ir así de fácil, por lo que esta es mi manera de hacerte saber lo que estoy sintiendo. Si tú estás feliz y te sientes plena con tu decisión, no puedo ser tan egoísta para pedirte que la reviertas,",

  "Pero si algo en ti está dudando o no se siente feliz con este estatus quo, hazle caso. La vida es muy corta como para negarse a sentir.",

  "De todas formas, no quería que nuestra última date haya acabado con un error tan tonto como el que cometí el pasado viernes, y no quiero que me quites tantos puntos en mi encuesta de satisfacción final… por lo que te debo una mejor última cita.",
];
```

After the final beat, tapping advances to the **QUESTION** screen. (Beats may be split further during implementation for pacing; the text content is the source of truth.)

---

## 5. Reading Experience (READING screen)

- **Layout:** immersive overlay (chosen option B). Full-screen `Scene` + `Particles`; the current beat's text floats centered over a `--scrim`; the `Character` walks along the meadow near the bottom as a living progress marker.
- **Advance:** tap anywhere (or a subtle "continuar ▸" affordance). Also supports keyboard (Space/→/Enter) and swipe on mobile.
- **No going back** by default (linear), but a faint `ProgressDots` shows position. (Back navigation optional; deferred unless requested.)
- **Per beat:** `p = index/(n-1)` drives sky gradient (dusk→gold), character x-position (left→right), particle warmth/density, and text color threshold.
- **Character emotion during reading:** gentle "walk"; leans slightly wistful in early beats, lighter by the last beats.

---

## 6. The Question (QUESTION screen)

- Scene at near-full golden hour. Character centered, hopeful, a little nervous.
- Heading in Great Vibes: **"¿Quieres salir conmigo una vez más a la cineteca de Chapultepec?"**
- Two buttons: **Sí** (`--coral`, prominent) and **No** (`--muted-rose`, secondary).
- Tapping **Sí** → `YES_FLOW`. Tapping **No** → `NO_ESCALATION` (counter starts at 1).

---

## 7. "No" Escalation (NO_ESCALATION screen)

State: `noCount` (int).

On each **No** tap, `noCount++` and:
- **Character sadness** increases by stage (Lottie emotion: `sad-1` … `sad-4`, then `dead`).
- **"No" button shrinks** one step (scale down), clamped to a minimum tappable size (≥ 44×44px hit area preserved via padding/hitbox even if visual is smaller).
- **"Sí" button grows** one step (scale up), inviting.

Thresholds:
| `noCount` | Effect |
|-----------|--------|
| 1–4 | Progressive sadness + shrink/grow, no modal |
| **5** | `WarningModal`: **"2 veces más y será definitivo"** |
| 6 | Continue shrink/grow + sadness |
| **7** | `WarningModal`: **"Última oportunidad"** |
| **8** | Character **death** animation → send definitive Telegram message → `DEAD_END` |

**DEAD_END screen:**
- Somber: scene dims back toward dusk, character collapsed (`dead` Lottie), a wilted-flower motif.
- A **small "Sí" still lingers** (quiet, low-emphasis). Tapping it → `YES_FLOW` (she can change her mind). The scene blooms back to gold on that tap.
- No "No" button here (it's already definitive).

**Telegram on death (fired once, guarded against duplicates):**
> `💔 Dijo que no… fue definitivo.`

---

## 8. "Sí" Flow (YES_FLOW screen)

1. **Celebration:** character jumps / excited (`happy` Lottie); scene floods to full golden hour; particles brighten.
2. **Question 1 — ¿Cuándo puedes?** (`QuestionCard`)
   - Este Sábado · El próximo Lunes · El próximo Viernes · **Otro día… ✎** (free-text input)
3. **Question 2 — ¿A qué hora te gustaría?** (`QuestionCard`)
   - 11 pm · 1 pm · 3 pm · **Otro… ✎** (free-text input)
4. **Closing message:** *"Paso por ti a tu casita y de ahí nos vamos juntos 💛"*
5. **HeartFinale:** Lottie heart animation closes the experience.

**Telegram on completion (single summary, fired once):**
> `💛 ¡Dijo que SÍ! 🎉\nCuándo: {cuando}\nHora: {hora}`

`{cuando}` / `{hora}` are the selected preset or the free-text "Otro" value.

**QuestionCard behavior:** preset options are large touch targets; selecting "Otro… ✎" reveals a text input and a confirm. Answers are held in state until both are done, then one `notify()` call sends the summary.

---

## 9. Telegram Integration

**Why a Worker:** the bot token must never ship in the client bundle. A Cloudflare Worker holds it as a secret env var and is the only thing that talks to Telegram.

**Worker (`worker/notify.js`):**
- `POST` endpoint. Body: `{ kind: "yes" | "no", cuando?, hora? }`.
- Builds the message text server-side (client cannot inject arbitrary content).
- Calls `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/sendMessage` with `chat_id = TELEGRAM_CHAT_ID`, JSON body, UTF-8 (emojis render correctly).
- **CORS:** `Access-Control-Allow-Origin` restricted to the GitLab Pages origin only.
- Env vars (Worker secrets, set via `wrangler secret` / dashboard): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

**Confirmed values (to be stored as Worker secrets, NOT in git):**
- Bot: `@dai_answer_bot`
- Chat ID: `1192867136`
- Token: tested working (store as secret; rotate via BotFather `/revoke` if desired).

**Frontend (`src/lib/notify.js`):**
- Reads `VITE_NOTIFY_URL` (the Worker URL).
- `notify({kind, cuando, hora})` → `fetch(POST)`; on network failure, retries once, then fails silently (never blocks her experience). A subtle console log only.

**Duplicate guard:** a module-level `sent` flag ensures the yes-summary and the death-message each fire at most once per session.

---

## 10. Animations & Free Asset Sources

| Purpose | Library / Source | License |
|---------|------------------|---------|
| Ambient field particles (motes/fireflies) | **tsParticles** (`@tsparticles/react`) | MIT |
| Character emotions (walk, sad stages, happy, dead) | **lottie-react** + LottieFiles assets | Free assets on LottieFiles / IconScout (verify per-asset license) |
| Heart finale (break → mend → glow) | **lottie-react** + LottieFiles broken/beating heart | Free (verify per-asset) |
| Fallback character (if no single Lottie fits all states) | **OpenGameArt CC0** sprite sheet, CSS/canvas frames | CC0 |

**Character approach:** prefer a single Lottie character with multiple named segments/states. If one asset can't cover walk+sad+happy+dead, fall back to a small set of Lottie clips (or a CC0 sprite sheet) swapped by an `emotion` prop. Final asset selection happens in implementation; the interface (`<Character emotion="walk|sad-1..4|happy|dead" p={p} />`) is fixed here.

Sources: LottieFiles (lottiefiles.com), IconScout (iconscout.com), OpenGameArt (opengameart.org), tsParticles (particles.js.org).

---

## 11. Responsive & Platform

- **Phone-first** (primary target, ~375–430px). Full-viewport scene, `min-h-dvh`, safe-area insets respected.
- **Desktop-adapted:** the scene centers in a portrait "stage" (max ~480px wide) with the golden-hour gradient bleeding to the edges of the viewport, so it feels intentional on a wide screen rather than stretched.
- Breakpoints: 375 / 768 / 1024. No horizontal scroll. Viewport meta with zoom enabled.

---

## 12. Accessibility

- **Contrast:** text ≥ 4.5:1 at every beat (cream↔sepia switch enforces this over the interpolated background).
- **Reduced motion:** `prefers-reduced-motion` → disable parallax/particles drift, replace beat transitions with simple fades, skip the death/heart flourishes to static end states.
- **Touch targets:** all buttons ≥ 44×44px hit area — including the shrunken "No" (visual shrinks, hitbox stays tappable).
- **Keyboard:** advance with Space/Enter/→; buttons focusable with visible focus rings; write-in inputs labeled.
- **Screen reader:** beat text in a `aria-live="polite"` region; character/particles `aria-hidden`; buttons have descriptive labels.

---

## 13. Out of Scope (this iteration)

- Editable/uploadable story text (letter is static).
- Multiple stories / accounts / auth.
- Persisting answers in a database (Telegram-only).
- Analytics.
- Deletion/editing of sent notifications.
- WhatsApp delivery (not available in this context; Telegram only).

---

## 14. Setup Steps (done by the user / during implementation)

1. **Telegram bot** — ✅ already created (`@dai_answer_bot`), token tested, chat ID `1192867136` captured.
2. **Cloudflare Worker** — deploy `worker/notify.js`; set secrets `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`; note the Worker URL.
3. **Frontend env** — put the Worker URL in `.env.local` as `VITE_NOTIFY_URL`.
4. **Build & deploy** — `vite build` → publish `dist/` to **GitLab Pages** (via GitLab CI `.gitlab-ci.yml` or manual upload). Set `base: '/ultima-cita/'` to match the Pages path.
5. **Share** the private link with the recipient.

---

## 15. Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | React + Vite | Matches prior project; fast static build |
| Styling | Tailwind + CSS custom properties | Utility + interpolable design tokens |
| Routing | None (`useState` state machine) | Few screens, linear flow |
| Story storage | Static JS module | Fixed content; no DB needed |
| Notifications | Cloudflare Worker → Telegram | Keeps bot token secret; static host can't |
| Host | GitLab Pages | Approved; static hosting for the SPA |
| Particles | tsParticles | Free, MIT, React component, GPU-light |
| Character/heart | Lottie (lottie-react) | Emotive, vector-crisp, small |
| Messaging | Telegram (not WhatsApp) | Free, simple, and the approved option |
