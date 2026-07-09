# Última Cita — Linear Storytelling App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a phone-first immersive storytelling web app that reveals a personal letter beat-by-beat over a meadow scene that warms from twilight to golden hour, ending in a Yes/No date invitation that notifies the author via Telegram.

**Architecture:** Single-page React app (Vite) with no router — a `screen` state machine in `App.jsx` moves through READING → QUESTION → (YES_FLOW | NO_ESCALATION → DEAD_END). Reading progress `p` (0→1) drives interpolated background colors, character position, and particle warmth. Pure logic (color interpolation, the No-escalation state machine) lives in tested `lib/` modules. A Cloudflare Worker holds the Telegram bot token and is the only thing that talks to Telegram; the frontend POSTs a small payload to it. No database — the letter is a static module.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, Vitest + React Testing Library, @tsparticles/react, lottie-react, Cloudflare Workers (wrangler).

**Reference values (already verified):** Telegram bot `@dai_answer_bot`, chat ID `1192867136`. Token is a Worker secret — never in the repo.

---

## File Map

```
ultima-cita/
├── index.html
├── vite.config.js                 ← base '/ultima-cita/', vitest config
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example                   ← VITE_NOTIFY_URL template (committed)
├── .env.local                     ← real Worker URL (gitignored)
├── .gitignore                     ← exists (node_modules, dist, .env.local, .superpowers)
├── wrangler.toml                  ← Cloudflare Worker config
├── worker/
│   └── notify.js                  ← Worker: builds message, calls Telegram
├── src/
│   ├── main.jsx                   ← React entry
│   ├── App.jsx                    ← screen state machine
│   ├── index.css                  ← fonts, CSS tokens, base styles
│   ├── test/setup.js              ← jest-dom setup
│   ├── content/
│   │   └── story.js               ← STORY beats (the letter)
│   ├── lib/
│   │   ├── progress.js            ← lerp, mixHex, sceneStyle(p), charX(p), textColor(p)
│   │   ├── noMachine.js           ← pure reducer for the No-escalation state
│   │   └── notify.js              ← POST to VITE_NOTIFY_URL (guarded, retry-once)
│   ├── hooks/
│   │   └── useReducedMotion.js    ← prefers-reduced-motion boolean
│   └── components/
│       ├── Scene.jsx              ← gradient sky + hills + meadow (styled by p)
│       ├── Particles.jsx          ← tsParticles wrapper, warmth from p
│       ├── Character.jsx          ← Lottie character, emotion + p props
│       ├── StoryText.jsx          ← floating beat text + scrim + tap-to-advance
│       ├── ProgressDots.jsx       ← subtle beat progress indicator
│       ├── QuestionScreen.jsx     ← invitation + Sí/No buttons
│       ├── WarningModal.jsx       ← "2 veces más…" / "Última oportunidad"
│       ├── NoEscalation.jsx       ← uses noMachine; shrink/grow, warnings, death
│       ├── QuestionCard.jsx       ← preset options + "Otro… ✎" write-in
│       ├── YesFlow.jsx            ← celebration → 2 questions → closing → heart
│       └── HeartFinale.jsx        ← Lottie heart close
```

**Build order rationale:** scaffold → styles/content → pure tested logic → notify → leaf components → branching components → App assembly → Worker → deploy config. Pure logic first so components consume tested functions.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/test/setup.js`

- [ ] **Step 1: Initialize Vite React project**

```bash
cd /c/Users/natan/.claude/code-projects/ultima-cita
npm create vite@latest . -- --template react
npm install
```

If prompted about the non-empty directory (docs/, .git/ exist), choose "Ignore files and continue".

- [ ] **Step 2: Install dependencies**

```bash
npm install @tsparticles/react @tsparticles/slim lottie-react
npm install -D tailwindcss@3 postcss autoprefixer vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Replace `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ultima-cita/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 4: Replace `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        script: ['"Great Vibes"', 'cursive'],
        body: ['"Cormorant Infant"', 'serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test scripts to `package.json`**

In `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 7: Minimal `src/App.jsx` placeholder**

```jsx
export default function App() {
  return <div>Última Cita</div>
}
```

- [ ] **Step 8: Verify dev server and tests**

Run: `npm run dev`
Expected: server at `http://localhost:5173/ultima-cita/`, page shows "Última Cita".
Run: `npm test`
Expected: "No test files found" (exit 0) — vitest configured, nothing to run yet.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js index.html src/
git commit -m "feat: scaffold React + Vite + Tailwind + Vitest"
```

---

## Task 2: Global Styles & Design Tokens

**Files:**
- Create/Replace: `src/index.css`

- [ ] **Step 1: Write `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Great+Vibes&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --dusk-top: #3E3355;
  --dusk-mid: #5A4A6A;
  --dusk-low: #7D6A72;
  --gold-top: #F7D489;
  --gold-mid: #EFAC6A;
  --gold-low: #E08A5E;
  --meadow-light: #A7BD77;
  --meadow-deep: #89A663;
  --hill-dusk: #40503F;
  --cream: #FBF3DE;
  --sepia: #4A2C14;
  --coral: #E08A5E;
  --muted-rose: #B06A68;
  --scrim: rgba(20, 14, 30, 0.35);
}

* { box-sizing: border-box; }

html, body, #root { height: 100%; margin: 0; }

body {
  font-family: 'Cormorant Infant', serif;
  background: #3E3355;
  color: var(--cream);
  overflow: hidden;
}

.font-script { font-family: 'Great Vibes', cursive; }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 2: Import CSS in `src/main.jsx`**

Ensure `src/main.jsx` contains:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Verify fonts load**

Run: `npm run dev`, open the app, check DevTools Network for `Great+Vibes` and `Cormorant+Infant` font requests (status 200).

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/main.jsx
git commit -m "feat: global styles, golden-hour tokens, romantic fonts"
```

---

## Task 3: Story Content

**Files:**
- Create: `src/content/story.js`
- Test: `src/content/story.test.js`

- [ ] **Step 1: Write the failing test**

`src/content/story.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { STORY } from './story'

describe('STORY', () => {
  it('is a non-empty array of strings', () => {
    expect(Array.isArray(STORY)).toBe(true)
    expect(STORY.length).toBeGreaterThan(0)
    STORY.forEach((beat) => expect(typeof beat).toBe('string'))
  })

  it('every beat has meaningful content (no empty/whitespace beats)', () => {
    STORY.forEach((beat) => expect(beat.trim().length).toBeGreaterThan(10))
  })

  it('starts with the opening line and ends before the question', () => {
    expect(STORY[0]).toMatch(/^No me imaginaba/)
    expect(STORY[STORY.length - 1]).toMatch(/mejor última cita\.$/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- story`
Expected: FAIL — `Cannot find module './story'`

- [ ] **Step 3: Implement `src/content/story.js`**

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
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- story`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/story.js src/content/story.test.js
git commit -m "feat: story content — the letter chunked into beats"
```

---

## Task 4: Progress & Color Interpolation

**Files:**
- Create: `src/lib/progress.js`
- Test: `src/lib/progress.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/progress.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { lerp, mixHex, charXPercent, textColor } from './progress'

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 1)).toBe(10)
    expect(lerp(0, 10, 0.5)).toBe(5)
  })
})

describe('mixHex', () => {
  it('returns start color at t=0 and end at t=1', () => {
    expect(mixHex('#000000', '#ffffff', 0).toLowerCase()).toBe('#000000')
    expect(mixHex('#000000', '#ffffff', 1).toLowerCase()).toBe('#ffffff')
  })
  it('returns a valid 7-char hex mid-way', () => {
    const mid = mixHex('#000000', '#ffffff', 0.5)
    expect(mid).toMatch(/^#[0-9a-f]{6}$/i)
    expect(mid.toLowerCase()).toBe('#808080')
  })
})

describe('charXPercent', () => {
  it('walks left (10%) to right (85%) as p goes 0→1', () => {
    expect(charXPercent(0)).toBeCloseTo(10)
    expect(charXPercent(1)).toBeCloseTo(85)
    expect(charXPercent(0.5)).toBeCloseTo(47.5)
  })
})

describe('textColor', () => {
  it('is cream while dark, sepia once bright (p > 0.6)', () => {
    expect(textColor(0)).toBe('var(--cream)')
    expect(textColor(0.5)).toBe('var(--cream)')
    expect(textColor(0.7)).toBe('var(--sepia)')
    expect(textColor(1)).toBe('var(--sepia)')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- progress`
Expected: FAIL — `Cannot find module './progress'`

- [ ] **Step 3: Implement `src/lib/progress.js`**

```js
export function lerp(a, b, t) {
  return a + (b - a) * t
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function toHex(n) {
  return Math.round(n).toString(16).padStart(2, '0')
}

export function mixHex(start, end, t) {
  const a = hexToRgb(start)
  const b = hexToRgb(end)
  return '#' + [0, 1, 2].map((i) => toHex(lerp(a[i], b[i], t))).join('')
}

// Dusk (nostalgic) → Gold (hopeful) sky stops, interpolated by p.
const DUSK = { top: '#3E3355', mid: '#5A4A6A', low: '#7D6A72' }
const GOLD = { top: '#F7D489', mid: '#EFAC6A', low: '#E08A5E' }

export function skyGradient(p) {
  const top = mixHex(DUSK.top, GOLD.top, p)
  const mid = mixHex(DUSK.mid, GOLD.mid, p)
  const low = mixHex(DUSK.low, GOLD.low, p)
  return `linear-gradient(${top}, ${mid} 55%, ${low})`
}

export function charXPercent(p) {
  return lerp(10, 85, p)
}

export function textColor(p) {
  return p > 0.6 ? 'var(--sepia)' : 'var(--cream)'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- progress`
Expected: PASS (all)

- [ ] **Step 5: Add a test for `skyGradient` and confirm**

Append to `src/lib/progress.test.js`:
```js
import { skyGradient } from './progress'

describe('skyGradient', () => {
  it('produces a linear-gradient string with three hex stops', () => {
    const g = skyGradient(0.5)
    expect(g).toMatch(/^linear-gradient\(#[0-9a-f]{6}, #[0-9a-f]{6} 55%, #[0-9a-f]{6}\)$/i)
  })
})
```
Run: `npm test -- progress`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/progress.js src/lib/progress.test.js
git commit -m "feat: progress interpolation — sky gradient, char position, text color"
```

---

## Task 5: No-Escalation State Machine

**Files:**
- Create: `src/lib/noMachine.js`
- Test: `src/lib/noMachine.test.js`

The reducer is pure so the escalation logic is fully tested without a DOM.

- [ ] **Step 1: Write the failing test**

`src/lib/noMachine.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { initialNoState, tapNo, sadnessStage, noScale, yesScale } from './noMachine'

describe('noMachine', () => {
  it('starts at count 0, alive, no modal', () => {
    const s = initialNoState()
    expect(s).toEqual({ count: 0, dead: false, modal: null })
  })

  it('increments count and shows no modal for taps 1-4', () => {
    let s = initialNoState()
    for (let i = 0; i < 4; i++) s = tapNo(s)
    expect(s.count).toBe(4)
    expect(s.modal).toBe(null)
    expect(s.dead).toBe(false)
  })

  it('shows warning 1 at tap 5', () => {
    let s = initialNoState()
    for (let i = 0; i < 5; i++) s = tapNo(s)
    expect(s.count).toBe(5)
    expect(s.modal).toBe('2 veces más y será definitivo')
  })

  it('shows warning 2 at tap 7', () => {
    let s = initialNoState()
    for (let i = 0; i < 7; i++) s = tapNo(s)
    expect(s.count).toBe(7)
    expect(s.modal).toBe('Última oportunidad')
  })

  it('dies at tap 8', () => {
    let s = initialNoState()
    for (let i = 0; i < 8; i++) s = tapNo(s)
    expect(s.count).toBe(8)
    expect(s.dead).toBe(true)
  })

  it('ignores further taps once dead', () => {
    let s = initialNoState()
    for (let i = 0; i < 10; i++) s = tapNo(s)
    expect(s.count).toBe(8)
    expect(s.dead).toBe(true)
  })

  it('sadnessStage rises with count and caps at 4', () => {
    expect(sadnessStage(0)).toBe(0)
    expect(sadnessStage(1)).toBe(1)
    expect(sadnessStage(4)).toBe(4)
    expect(sadnessStage(7)).toBe(4)
  })

  it('noScale shrinks but never below 0.4; yesScale grows but caps at 1.8', () => {
    expect(noScale(0)).toBe(1)
    expect(noScale(8)).toBeGreaterThanOrEqual(0.4)
    expect(noScale(100)).toBe(0.4)
    expect(yesScale(0)).toBe(1)
    expect(yesScale(100)).toBe(1.8)
    expect(yesScale(4)).toBeGreaterThan(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- noMachine`
Expected: FAIL — `Cannot find module './noMachine'`

- [ ] **Step 3: Implement `src/lib/noMachine.js`**

```js
export function initialNoState() {
  return { count: 0, dead: false, modal: null }
}

export function tapNo(state) {
  if (state.dead) return state
  const count = state.count + 1
  const dead = count >= 8
  let modal = null
  if (count === 5) modal = '2 veces más y será definitivo'
  else if (count === 7) modal = 'Última oportunidad'
  return { count, dead, modal }
}

export function sadnessStage(count) {
  return Math.min(4, count)
}

export function noScale(count) {
  return Math.max(0.4, 1 - count * 0.08)
}

export function yesScale(count) {
  return Math.min(1.8, 1 + count * 0.1)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- noMachine`
Expected: PASS (all)

- [ ] **Step 5: Commit**

```bash
git add src/lib/noMachine.js src/lib/noMachine.test.js
git commit -m "feat: No-escalation pure state machine with warnings and death"
```

---

## Task 6: Notify Library (client)

**Files:**
- Create: `src/lib/notify.js`
- Test: `src/lib/notify.test.js`
- Create: `.env.example`

- [ ] **Step 1: Write the failing test**

`src/lib/notify.test.js`:
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- notify`
Expected: FAIL — `Cannot find module './notify'`

- [ ] **Step 3: Implement `src/lib/notify.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- notify`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `.env.example`**

```
VITE_NOTIFY_URL=https://your-worker-subdomain.workers.dev/notify
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/notify.js src/lib/notify.test.js .env.example
git commit -m "feat: client notify lib — guarded, retry-once POST to Worker"
```

---

## Task 7: useReducedMotion Hook

**Files:**
- Create: `src/hooks/useReducedMotion.js`
- Test: `src/hooks/useReducedMotion.test.js`

- [ ] **Step 1: Write the failing test**

`src/hooks/useReducedMotion.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

function mockMatchMedia(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('useReducedMotion', () => {
  it('returns true when the user prefers reduced motion', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('returns false otherwise', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useReducedMotion`
Expected: FAIL — `Cannot find module './useReducedMotion'`

- [ ] **Step 3: Implement `src/hooks/useReducedMotion.js`**

```js
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useReducedMotion`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useReducedMotion.js src/hooks/useReducedMotion.test.js
git commit -m "feat: useReducedMotion hook"
```

---

## Task 8: Scene Component

**Files:**
- Create: `src/components/Scene.jsx`
- Test: `src/components/Scene.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/Scene.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Scene } from './Scene'

describe('Scene', () => {
  it('renders a sky element with a linear-gradient background from p', () => {
    const { getByTestId } = render(<Scene p={0.5} />)
    const sky = getByTestId('scene-sky')
    expect(sky.style.background).toContain('linear-gradient')
  })

  it('renders hills and meadow layers', () => {
    const { getByTestId } = render(<Scene p={0} />)
    expect(getByTestId('scene-hills')).toBeInTheDocument()
    expect(getByTestId('scene-meadow')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Scene`
Expected: FAIL — `Cannot find module './Scene'`

- [ ] **Step 3: Implement `src/components/Scene.jsx`**

```jsx
import { skyGradient, mixHex } from '../lib/progress'

export function Scene({ p }) {
  const hillColor = mixHex('#40503F', '#6B7A4A', p)
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        data-testid="scene-sky"
        className="absolute inset-0"
        style={{ background: skyGradient(p), transition: 'background 700ms ease-out' }}
      />
      <div
        data-testid="scene-hills"
        className="absolute left-0 right-0"
        style={{
          bottom: '18%',
          height: '22%',
          background: hillColor,
          borderRadius: '50% 50% 0 0 / 40% 40% 0 0',
          transition: 'background 700ms ease-out',
        }}
      />
      <div
        data-testid="scene-meadow"
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '22%',
          background: 'linear-gradient(var(--meadow-light), var(--meadow-deep))',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Scene`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Scene.jsx src/components/Scene.test.jsx
git commit -m "feat: Scene — interpolated sky, hills, meadow layers"
```

---

## Task 9: Particles Component

**Files:**
- Create: `src/components/Particles.jsx`
- Test: `src/components/Particles.test.jsx`

tsParticles' engine touches browser APIs, so mock it and assert our wrapper wires warmth from `p`. It also consumes `useReducedMotion` (Task 7) to disable drift when requested.

- [ ] **Step 1: Write the failing test**

`src/components/Particles.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@tsparticles/react', () => ({
  __esModule: true,
  initParticlesEngine: vi.fn().mockResolvedValue(undefined),
  default: (props) => <div data-testid="tsparticles" data-options={JSON.stringify(props.options)} />,
}))
vi.mock('@tsparticles/slim', () => ({ loadSlim: vi.fn() }))

const reducedMock = vi.fn()
vi.mock('../hooks/useReducedMotion', () => ({ useReducedMotion: () => reducedMock() }))

import { Particles } from './Particles'

describe('Particles', () => {
  it('renders the particles container', () => {
    reducedMock.mockReturnValue(false)
    const { getByTestId } = render(<Particles p={0.2} />)
    expect(getByTestId('tsparticles')).toBeInTheDocument()
  })

  it('warms particle color as p increases', () => {
    reducedMock.mockReturnValue(false)
    const { getByTestId, rerender } = render(<Particles p={0} />)
    const cold = JSON.parse(getByTestId('tsparticles').dataset.options)
    rerender(<Particles p={1} />)
    const warm = JSON.parse(getByTestId('tsparticles').dataset.options)
    expect(cold.particles.color.value).not.toBe(warm.particles.color.value)
  })

  it('disables particle movement when reduced motion is preferred', () => {
    reducedMock.mockReturnValue(true)
    const { getByTestId } = render(<Particles p={0.5} />)
    const opts = JSON.parse(getByTestId('tsparticles').dataset.options)
    expect(opts.particles.move.enable).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Particles`
Expected: FAIL — `Cannot find module './Particles'`

- [ ] **Step 3: Implement `src/components/Particles.jsx`**

```jsx
import { useEffect, useMemo, useState } from 'react'
import ParticlesLib, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { mixHex, lerp } from '../lib/progress'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Particles({ p }) {
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      particles: {
        number: { value: Math.round(lerp(18, 42, p)) },
        color: { value: mixHex('#9db6d6', '#ffe6a8', p) },
        opacity: { value: lerp(0.25, 0.55, p) },
        size: { value: { min: 1, max: 3 } },
        move: { enable: !reduced, speed: lerp(0.3, 0.8, p), direction: 'top', outModes: 'out' },
      },
      detectRetina: true,
    }),
    [p, reduced]
  )

  if (!ready) return null
  return <ParticlesLib id="tsparticles" options={options} className="absolute inset-0" />
}
```

> Note: the default export of `@tsparticles/react` is the Particles component, imported here as `ParticlesLib` to avoid shadowing our own `Particles` wrapper. The test mocks that default export, so keep the rendered element bound to it. If `initParticlesEngine`/default export names differ in your installed version, adjust the import — the test pins the contract we rely on.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Particles`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Particles.jsx src/components/Particles.test.jsx
git commit -m "feat: Particles — tsParticles ambient layer warming with progress"
```

---

## Task 10: Character Component

**Files:**
- Create: `src/components/Character.jsx`
- Test: `src/components/Character.test.jsx`
- Create: `src/assets/lottie/` (placeholder JSON added here in Step 3)

The Character exposes a fixed interface; the actual Lottie art is dropped in as JSON files. We test positioning and emotion mapping, mocking `lottie-react`.

- [ ] **Step 1: Write the failing test**

`src/components/Character.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('lottie-react', () => ({
  __esModule: true,
  default: (props) => <div data-testid="lottie" data-emotion={props['data-emotion']} />,
}))

import { Character } from './Character'

describe('Character', () => {
  it('positions itself horizontally from p', () => {
    const { getByTestId } = render(<Character emotion="walk" p={0.5} />)
    expect(getByTestId('character').style.left).toBe('47.5%')
  })

  it('passes the emotion through', () => {
    const { getByTestId } = render(<Character emotion="happy" p={0} />)
    expect(getByTestId('lottie').dataset.emotion).toBe('happy')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Character`
Expected: FAIL — `Cannot find module './Character'`

- [ ] **Step 3: Add placeholder Lottie assets**

Create `src/assets/lottie/placeholder.json` (a minimal valid Lottie so imports resolve; replace with real art later):
```json
{"v":"5.7.4","fr":30,"ip":0,"op":30,"w":100,"h":100,"nm":"placeholder","ddd":0,"assets":[],"layers":[]}
```

- [ ] **Step 4: Implement `src/components/Character.jsx`**

```jsx
import Lottie from 'lottie-react'
import { charXPercent } from '../lib/progress'
import placeholder from '../assets/lottie/placeholder.json'

// Map emotion → animation data. Swap placeholder for real art per state later.
const ANIMATIONS = {
  walk: placeholder,
  'sad-1': placeholder,
  'sad-2': placeholder,
  'sad-3': placeholder,
  'sad-4': placeholder,
  happy: placeholder,
  dead: placeholder,
}

export function Character({ emotion, p }) {
  const data = ANIMATIONS[emotion] ?? placeholder
  return (
    <div
      data-testid="character"
      className="absolute"
      style={{
        left: `${charXPercent(p)}%`,
        bottom: '20%',
        width: '72px',
        height: '110px',
        transform: 'translateX(-50%)',
        transition: 'left 700ms ease-out',
      }}
    >
      <Lottie animationData={data} loop data-emotion={emotion} aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Character`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/Character.jsx src/components/Character.test.jsx src/assets/lottie/placeholder.json
git commit -m "feat: Character — Lottie by emotion, position from progress"
```

---

## Task 11: StoryText Component

**Files:**
- Create: `src/components/StoryText.jsx`
- Test: `src/components/StoryText.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/StoryText.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoryText } from './StoryText'

describe('StoryText', () => {
  it('shows the current beat text', () => {
    render(<StoryText text="Hola mundo" p={0} onAdvance={() => {}} />)
    expect(screen.getByText('Hola mundo')).toBeInTheDocument()
  })

  it('uses an aria-live region for the beat', () => {
    render(<StoryText text="Beat" p={0} onAdvance={() => {}} />)
    expect(screen.getByTestId('beat-live')).toHaveAttribute('aria-live', 'polite')
  })

  it('calls onAdvance when tapped', async () => {
    const onAdvance = vi.fn()
    render(<StoryText text="Beat" p={0} onAdvance={onAdvance} />)
    await userEvent.click(screen.getByTestId('advance-zone'))
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('calls onAdvance on Enter / Space / ArrowRight', async () => {
    const onAdvance = vi.fn()
    render(<StoryText text="Beat" p={0} onAdvance={onAdvance} />)
    const zone = screen.getByTestId('advance-zone')
    zone.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowRight}')
    expect(onAdvance).toHaveBeenCalledTimes(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- StoryText`
Expected: FAIL — `Cannot find module './StoryText'`

- [ ] **Step 3: Implement `src/components/StoryText.jsx`**

```jsx
import { textColor } from '../lib/progress'

export function StoryText({ text, p, onAdvance }) {
  function onKey(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault()
      onAdvance()
    }
  }

  return (
    <div
      data-testid="advance-zone"
      role="button"
      tabIndex={0}
      onClick={onAdvance}
      onKeyDown={onKey}
      aria-label="Continuar la historia"
      className="absolute inset-0 flex items-center justify-center px-8 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'var(--scrim)', pointerEvents: 'none' }}
      />
      <div className="relative max-w-md text-center">
        <p
          data-testid="beat-live"
          aria-live="polite"
          className="font-body text-xl md:text-2xl leading-relaxed"
          style={{ color: textColor(p), textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        >
          {text}
        </p>
        <p className="mt-6 text-sm tracking-widest uppercase opacity-60" style={{ color: textColor(p) }}>
          tocar para continuar ▸
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- StoryText`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/StoryText.jsx src/components/StoryText.test.jsx
git commit -m "feat: StoryText — floating beat, scrim, tap/keyboard advance"
```

---

## Task 12: ProgressDots Component

**Files:**
- Create: `src/components/ProgressDots.jsx`
- Test: `src/components/ProgressDots.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/ProgressDots.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressDots } from './ProgressDots'

describe('ProgressDots', () => {
  it('renders one dot per beat', () => {
    render(<ProgressDots total={5} current={2} />)
    expect(screen.getAllByTestId('dot')).toHaveLength(5)
  })

  it('marks the current dot active', () => {
    render(<ProgressDots total={3} current={1} />)
    const dots = screen.getAllByTestId('dot')
    expect(dots[1].dataset.active).toBe('true')
    expect(dots[0].dataset.active).toBe('false')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProgressDots`
Expected: FAIL — `Cannot find module './ProgressDots'`

- [ ] **Step 3: Implement `src/components/ProgressDots.jsx`**

```jsx
export function ProgressDots({ total, current }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          data-testid="dot"
          data-active={i === current ? 'true' : 'false'}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i === current ? 'var(--cream)' : 'rgba(251,243,222,0.35)' }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ProgressDots`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ProgressDots.jsx src/components/ProgressDots.test.jsx
git commit -m "feat: ProgressDots — subtle beat progress indicator"
```

---

## Task 13: WarningModal Component

**Files:**
- Create: `src/components/WarningModal.jsx`
- Test: `src/components/WarningModal.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/WarningModal.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WarningModal } from './WarningModal'

describe('WarningModal', () => {
  it('shows the message', () => {
    render(<WarningModal message="Última oportunidad" onClose={() => {}} />)
    expect(screen.getByText('Última oportunidad')).toBeInTheDocument()
  })

  it('calls onClose when the button is clicked', async () => {
    const onClose = vi.fn()
    render(<WarningModal message="x" onClose={onClose} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('has role="alertdialog"', () => {
    render(<WarningModal message="x" onClose={() => {}} />)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- WarningModal`
Expected: FAIL — `Cannot find module './WarningModal'`

- [ ] **Step 3: Implement `src/components/WarningModal.jsx`**

```jsx
export function WarningModal({ message, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(20,14,30,0.7)' }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="max-w-xs w-full rounded-2xl p-8 text-center"
        style={{ background: 'var(--cream)', color: 'var(--sepia)' }}
      >
        <p className="font-script text-3xl mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full text-white font-body"
          style={{ background: 'var(--coral)', minHeight: '44px' }}
        >
          Entiendo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- WarningModal`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/WarningModal.jsx src/components/WarningModal.test.jsx
git commit -m "feat: WarningModal — accessible alertdialog for No warnings"
```

---

## Task 14: QuestionScreen Component

**Files:**
- Create: `src/components/QuestionScreen.jsx`
- Test: `src/components/QuestionScreen.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/QuestionScreen.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionScreen } from './QuestionScreen'

describe('QuestionScreen', () => {
  it('shows the invitation question', () => {
    render(<QuestionScreen onYes={() => {}} onNo={() => {}} />)
    expect(screen.getByText(/cineteca de Chapultepec/i)).toBeInTheDocument()
  })

  it('calls onYes / onNo', async () => {
    const onYes = vi.fn()
    const onNo = vi.fn()
    render(<QuestionScreen onYes={onYes} onNo={onNo} />)
    await userEvent.click(screen.getByRole('button', { name: /^sí$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^no$/i }))
    expect(onYes).toHaveBeenCalled()
    expect(onNo).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- QuestionScreen`
Expected: FAIL — `Cannot find module './QuestionScreen'`

- [ ] **Step 3: Implement `src/components/QuestionScreen.jsx`**

```jsx
export function QuestionScreen({ onYes, onNo }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <h1
        className="font-script text-4xl md:text-5xl mb-12 max-w-lg"
        style={{ color: 'var(--sepia)', textShadow: '0 1px 6px rgba(255,255,255,0.3)' }}
      >
        ¿Quieres salir conmigo una vez más a la cineteca de Chapultepec?
      </h1>
      <div className="flex gap-6 items-center">
        <button
          onClick={onYes}
          className="px-8 py-3 rounded-full text-white font-body text-lg"
          style={{ background: 'var(--coral)', minHeight: '44px' }}
        >
          Sí
        </button>
        <button
          onClick={onNo}
          className="px-8 py-3 rounded-full text-white font-body text-lg"
          style={{ background: 'var(--muted-rose)', minHeight: '44px' }}
        >
          No
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- QuestionScreen`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/QuestionScreen.jsx src/components/QuestionScreen.test.jsx
git commit -m "feat: QuestionScreen — the date invitation with Sí/No"
```

---

## Task 15: NoEscalation Component

**Files:**
- Create: `src/components/NoEscalation.jsx`
- Test: `src/components/NoEscalation.test.jsx`

Wires `noMachine` to the UI: shrinking No, growing Sí, warnings, death → `onDead`, and a lingering Sí on the dead-end that calls `onYes`.

- [ ] **Step 1: Write the failing test**

`src/components/NoEscalation.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoEscalation } from './NoEscalation'

async function tapNoTimes(n) {
  for (let i = 0; i < n; i++) {
    await userEvent.click(screen.getByRole('button', { name: /^no$/i }))
    // dismiss any warning modal that appears
    const dismiss = screen.queryByRole('button', { name: /entiendo/i })
    if (dismiss) await userEvent.click(dismiss)
  }
}

describe('NoEscalation', () => {
  it('shows warning 1 at the 5th No', async () => {
    render(<NoEscalation onDead={() => {}} onYes={() => {}} />)
    await tapNoTimes(5)
    expect(screen.getByText('2 veces más y será definitivo')).toBeInTheDocument()
  })

  it('calls onDead at the 8th No and shows the lingering Sí', async () => {
    const onDead = vi.fn()
    render(<NoEscalation onDead={onDead} onYes={() => {}} />)
    await tapNoTimes(8)
    expect(onDead).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /sí/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^no$/i })).not.toBeInTheDocument()
  })

  it('lingering Sí after death calls onYes', async () => {
    const onYes = vi.fn()
    render(<NoEscalation onDead={() => {}} onYes={onYes} />)
    await tapNoTimes(8)
    await userEvent.click(screen.getByRole('button', { name: /sí/i }))
    expect(onYes).toHaveBeenCalled()
  })

  it('the Sí button is present throughout and calls onYes before death', async () => {
    const onYes = vi.fn()
    render(<NoEscalation onDead={() => {}} onYes={onYes} />)
    await tapNoTimes(2)
    await userEvent.click(screen.getByRole('button', { name: /^sí$/i }))
    expect(onYes).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- NoEscalation`
Expected: FAIL — `Cannot find module './NoEscalation'`

- [ ] **Step 3: Implement `src/components/NoEscalation.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { initialNoState, tapNo, noScale, yesScale, sadnessStage } from '../lib/noMachine'
import { Character } from './Character'
import { WarningModal } from './WarningModal'

export function NoEscalation({ onDead, onYes }) {
  const [state, setState] = useState(initialNoState)

  useEffect(() => {
    if (state.dead) onDead()
    // onDead is guarded upstream (notify) so calling once on death is fine
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.dead])

  function handleNo() {
    setState((s) => tapNo(s))
  }

  function dismissModal() {
    setState((s) => ({ ...s, modal: null }))
  }

  const emotion = state.dead ? 'dead' : `sad-${Math.max(1, sadnessStage(state.count))}`
  const p = state.dead ? 0.1 : 0.5

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <Character emotion={emotion} p={p} />

      {state.dead ? (
        <div className="relative z-10 mt-24">
          <p className="font-script text-3xl mb-8" style={{ color: 'var(--cream)' }}>
            {'…'}
          </p>
          <button
            onClick={onYes}
            className="px-4 py-2 rounded-full font-body text-sm opacity-70"
            style={{ background: 'var(--coral)', color: 'white', minHeight: '44px' }}
          >
            …¿Sí?
          </button>
        </div>
      ) : (
        <div className="relative z-10 mt-24 flex gap-6 items-center">
          <button
            onClick={onYes}
            className="rounded-full text-white font-body"
            style={{
              background: 'var(--coral)',
              transform: `scale(${yesScale(state.count)})`,
              transition: 'transform 250ms ease-out',
              padding: '12px 32px',
              minHeight: '44px',
            }}
          >
            Sí
          </button>
          <button
            onClick={handleNo}
            className="rounded-full text-white font-body"
            style={{
              background: 'var(--muted-rose)',
              transform: `scale(${noScale(state.count)})`,
              transition: 'transform 250ms ease-out',
              padding: '12px 32px',
              minHeight: '44px',
            }}
          >
            No
          </button>
        </div>
      )}

      {state.modal && <WarningModal message={state.modal} onClose={dismissModal} />}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- NoEscalation`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/NoEscalation.jsx src/components/NoEscalation.test.jsx
git commit -m "feat: NoEscalation — shrink/grow buttons, warnings, death, lingering Sí"
```

---

## Task 16: QuestionCard Component

**Files:**
- Create: `src/components/QuestionCard.jsx`
- Test: `src/components/QuestionCard.test.jsx`

Preset options + an "Otro… ✎" write-in that reveals a text field.

- [ ] **Step 1: Write the failing test**

`src/components/QuestionCard.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionCard } from './QuestionCard'

const OPTIONS = ['Este Sábado', 'El próximo Lunes', 'El próximo Viernes']

describe('QuestionCard', () => {
  it('renders the title and preset options', () => {
    render(<QuestionCard title="¿Cuándo puedes?" options={OPTIONS} onAnswer={() => {}} />)
    expect(screen.getByText('¿Cuándo puedes?')).toBeInTheDocument()
    OPTIONS.forEach((o) => expect(screen.getByRole('button', { name: o })).toBeInTheDocument())
  })

  it('calls onAnswer with the chosen preset', async () => {
    const onAnswer = vi.fn()
    render(<QuestionCard title="t" options={OPTIONS} onAnswer={onAnswer} />)
    await userEvent.click(screen.getByRole('button', { name: 'El próximo Lunes' }))
    expect(onAnswer).toHaveBeenCalledWith('El próximo Lunes')
  })

  it('reveals a text field for "Otro" and submits the typed value', async () => {
    const onAnswer = vi.fn()
    render(<QuestionCard title="t" options={OPTIONS} onAnswer={onAnswer} />)
    await userEvent.click(screen.getByRole('button', { name: /otro/i }))
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'El domingo')
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onAnswer).toHaveBeenCalledWith('El domingo')
  })

  it('does not submit an empty "Otro" value', async () => {
    const onAnswer = vi.fn()
    render(<QuestionCard title="t" options={OPTIONS} onAnswer={onAnswer} />)
    await userEvent.click(screen.getByRole('button', { name: /otro/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onAnswer).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- QuestionCard`
Expected: FAIL — `Cannot find module './QuestionCard'`

- [ ] **Step 3: Implement `src/components/QuestionCard.jsx`**

```jsx
import { useState } from 'react'

export function QuestionCard({ title, options, onAnswer }) {
  const [writing, setWriting] = useState(false)
  const [value, setValue] = useState('')

  function confirmOther() {
    const v = value.trim()
    if (v) onAnswer(v)
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <h2 className="font-script text-4xl mb-8" style={{ color: 'var(--sepia)' }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onAnswer(o)}
            className="px-5 py-3 rounded-xl font-body text-lg"
            style={{ background: 'var(--cream)', color: 'var(--sepia)', minHeight: '44px' }}
          >
            {o}
          </button>
        ))}

        {!writing ? (
          <button
            onClick={() => setWriting(true)}
            className="px-5 py-3 rounded-xl font-body text-lg italic"
            style={{ background: 'rgba(251,243,222,0.7)', color: 'var(--sepia)', minHeight: '44px' }}
          >
            Otro… ✎
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <label htmlFor="otro" className="sr-only">Otro</label>
            <input
              id="otro"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="px-4 py-3 rounded-xl font-body text-lg"
              style={{ background: 'white', color: 'var(--sepia)', minHeight: '44px' }}
              placeholder="Escribe aquí…"
              autoFocus
            />
            <button
              onClick={confirmOther}
              className="px-5 py-3 rounded-xl text-white font-body text-lg"
              style={{ background: 'var(--coral)', minHeight: '44px' }}
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- QuestionCard`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/QuestionCard.jsx src/components/QuestionCard.test.jsx
git commit -m "feat: QuestionCard — presets plus Otro write-in"
```

---

## Task 17: HeartFinale Component

**Files:**
- Create: `src/components/HeartFinale.jsx`
- Test: `src/components/HeartFinale.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/HeartFinale.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('lottie-react', () => ({
  __esModule: true,
  default: () => <div data-testid="lottie-heart" />,
}))

import { HeartFinale } from './HeartFinale'

describe('HeartFinale', () => {
  it('renders the closing message and the heart animation', () => {
    render(<HeartFinale />)
    expect(screen.getByText(/Paso por ti a tu casita/i)).toBeInTheDocument()
    expect(screen.getByTestId('lottie-heart')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- HeartFinale`
Expected: FAIL — `Cannot find module './HeartFinale'`

- [ ] **Step 3: Implement `src/components/HeartFinale.jsx`**

```jsx
import Lottie from 'lottie-react'
import placeholder from '../assets/lottie/placeholder.json'

export function HeartFinale() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <div style={{ width: 160, height: 160 }}>
        <Lottie animationData={placeholder} loop aria-hidden="true" />
      </div>
      <p className="font-script text-3xl mt-6 max-w-sm" style={{ color: 'var(--sepia)' }}>
        Paso por ti a tu casita y de ahí nos vamos juntos 💛
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- HeartFinale`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HeartFinale.jsx src/components/HeartFinale.test.jsx
git commit -m "feat: HeartFinale — closing message and heart animation"
```

---

## Task 18: YesFlow Component

**Files:**
- Create: `src/components/YesFlow.jsx`
- Test: `src/components/YesFlow.test.jsx`

Sequences the two questions, collects answers, fires ONE `notify({kind:'yes', cuando, hora})`, then shows the HeartFinale.

- [ ] **Step 1: Write the failing test**

`src/components/YesFlow.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../lib/notify', () => ({ notify: vi.fn().mockResolvedValue(undefined) }))
vi.mock('lottie-react', () => ({ __esModule: true, default: () => <div data-testid="lottie-heart" /> }))

import { YesFlow } from './YesFlow'
import { notify } from '../lib/notify'

describe('YesFlow', () => {
  beforeEach(() => notify.mockClear())

  it('asks when, then time, then sends one summary and shows the finale', async () => {
    render(<YesFlow />)

    // Question 1: ¿Cuándo puedes?
    expect(screen.getByText(/¿Cuándo puedes\?/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Este Sábado' }))

    // Question 2: ¿A qué hora?
    expect(screen.getByText(/¿A qué hora/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '3 pm' }))

    // Notify called once with the summary
    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith({ kind: 'yes', cuando: 'Este Sábado', hora: '3 pm' })

    // Finale visible
    expect(screen.getByText(/Paso por ti a tu casita/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- YesFlow`
Expected: FAIL — `Cannot find module './YesFlow'`

- [ ] **Step 3: Implement `src/components/YesFlow.jsx`**

```jsx
import { useState } from 'react'
import { QuestionCard } from './QuestionCard'
import { HeartFinale } from './HeartFinale'
import { Character } from './Character'
import { notify } from '../lib/notify'

const WHEN = ['Este Sábado', 'El próximo Lunes', 'El próximo Viernes']
const TIME = ['11 pm', '1 pm', '3 pm']

export function YesFlow() {
  const [step, setStep] = useState('cuando') // 'cuando' | 'hora' | 'finale'
  const [cuando, setCuando] = useState('')

  function answerCuando(v) {
    setCuando(v)
    setStep('hora')
  }

  function answerHora(v) {
    notify({ kind: 'yes', cuando, hora: v })
    setStep('finale')
  }

  return (
    <div className="absolute inset-0">
      <Character emotion="happy" p={1} />
      {step === 'cuando' && (
        <QuestionCard title="¿Cuándo puedes?" options={WHEN} onAnswer={answerCuando} />
      )}
      {step === 'hora' && (
        <QuestionCard title="¿A qué hora te gustaría?" options={TIME} onAnswer={answerHora} />
      )}
      {step === 'finale' && <HeartFinale />}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- YesFlow`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/YesFlow.jsx src/components/YesFlow.test.jsx
git commit -m "feat: YesFlow — two questions, single summary notify, heart finale"
```

---

## Task 19: App Assembly (screen state machine)

**Files:**
- Replace: `src/App.jsx`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/App.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./lib/notify', () => ({ notify: vi.fn().mockResolvedValue(undefined) }))
vi.mock('lottie-react', () => ({ __esModule: true, default: () => <div data-testid="lottie" /> }))
vi.mock('./components/Particles', () => ({ Particles: () => <div data-testid="particles" /> }))

import App from './App'
import { STORY } from './content/story'

async function advanceThroughStory() {
  for (let i = 0; i < STORY.length; i++) {
    await userEvent.click(screen.getByTestId('advance-zone'))
  }
}

describe('App', () => {
  it('starts on the first beat of the story', () => {
    render(<App />)
    expect(screen.getByText(STORY[0])).toBeInTheDocument()
  })

  it('reaches the question after the last beat', async () => {
    render(<App />)
    await advanceThroughStory()
    expect(screen.getByText(/cineteca de Chapultepec/i)).toBeInTheDocument()
  })

  it('Sí leads into the Yes flow', async () => {
    render(<App />)
    await advanceThroughStory()
    await userEvent.click(screen.getByRole('button', { name: /^sí$/i }))
    expect(screen.getByText(/¿Cuándo puedes\?/i)).toBeInTheDocument()
  })

  it('No leads into the escalation', async () => {
    render(<App />)
    await advanceThroughStory()
    await userEvent.click(screen.getByRole('button', { name: /^no$/i }))
    // still two buttons present (Sí + No) in the escalation
    expect(screen.getAllByRole('button', { name: /^(sí|no)$/i }).length).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- App`
Expected: FAIL — App still the placeholder; assertions fail.

- [ ] **Step 3: Implement `src/App.jsx`**

```jsx
import { useState } from 'react'
import { STORY } from './content/story'
import { Scene } from './components/Scene'
import { Particles } from './components/Particles'
import { Character } from './components/Character'
import { StoryText } from './components/StoryText'
import { ProgressDots } from './components/ProgressDots'
import { QuestionScreen } from './components/QuestionScreen'
import { NoEscalation } from './components/NoEscalation'
import { YesFlow } from './components/YesFlow'
import { notify } from './lib/notify'

const READING = 'READING'
const QUESTION = 'QUESTION'
const YES_FLOW = 'YES_FLOW'
const NO_ESCALATION = 'NO_ESCALATION'

export default function App() {
  const [screen, setScreen] = useState(READING)
  const [beat, setBeat] = useState(0)

  const total = STORY.length
  const readingP = total > 1 ? beat / (total - 1) : 1
  // At the question and beyond, the scene sits at full golden hour.
  const p = screen === READING ? readingP : 1

  function advance() {
    if (beat < total - 1) setBeat((b) => b + 1)
    else setScreen(QUESTION)
  }

  return (
    <div className="relative mx-auto h-full overflow-hidden" style={{ maxWidth: 480 }}>
      <Scene p={p} />
      <Particles p={p} />

      {screen === READING && (
        <>
          <Character emotion="walk" p={p} />
          <ProgressDots total={total} current={beat} />
          <StoryText text={STORY[beat]} p={p} onAdvance={advance} />
        </>
      )}

      {screen === QUESTION && (
        <QuestionScreen onYes={() => setScreen(YES_FLOW)} onNo={() => setScreen(NO_ESCALATION)} />
      )}

      {screen === NO_ESCALATION && (
        <NoEscalation
          onDead={() => notify({ kind: 'no' })}
          onYes={() => setScreen(YES_FLOW)}
        />
      )}

      {screen === YES_FLOW && <YesFlow />}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- App`
Expected: PASS (4 tests)

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Manual smoke test**

Run: `npm run dev`, tap through the whole story → question → try both Sí and No branches. Confirm scene warms, character walks, buttons scale, warnings appear at taps 5 & 7, death at 8 with lingering Sí.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: App — screen state machine wiring the full experience"
```

---

## Task 20: Cloudflare Worker (Telegram relay)

**Files:**
- Create: `worker/notify.js`
- Create: `wrangler.toml`
- Test: `worker/notify.test.js`

- [ ] **Step 1: Write the failing test**

`worker/notify.test.js`:
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run worker/notify.test.js`
Expected: FAIL — `Cannot find module './notify'`

- [ ] **Step 3: Implement `worker/notify.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run worker/notify.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `wrangler.toml`**

```toml
name = "ultima-cita-notify"
main = "worker/notify.js"
compatibility_date = "2026-07-08"

# Secrets (set via: npx wrangler secret put TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)
# Vars below are non-secret and safe to commit.
[vars]
ALLOWED_ORIGIN = "https://REPLACE-WITH-YOUR-GITLAB-PAGES-ORIGIN"
```

- [ ] **Step 6: Commit**

```bash
git add worker/notify.js worker/notify.test.js wrangler.toml
git commit -m "feat: Cloudflare Worker — Telegram relay with CORS and message building"
```

---

## Task 21: Deploy Configuration (GitLab Pages CI)

**Files:**
- Create: `.gitlab-ci.yml`
- Modify: `vite.config.js` (confirm `base`)

- [ ] **Step 1: Create `.gitlab-ci.yml`**

GitLab Pages serves the `public/` artifact. Vite builds to `dist/`, so we copy it.

```yaml
image: node:20

pages:
  stage: deploy
  script:
    - npm ci
    - npm test
    - npm run build
    - rm -rf public && mv dist public
  artifacts:
    paths:
      - public
  variables:
    VITE_NOTIFY_URL: $VITE_NOTIFY_URL   # set in GitLab CI/CD variables
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

- [ ] **Step 2: Confirm the Pages base path**

`vite.config.js` `base` must match the GitLab Pages URL path. For a project page at `https://<user>.gitlab.io/ultima-cita/`, keep `base: '/ultima-cita/'`. For a user/group root page, change to `base: '/'`. Note this in the README step below.

- [ ] **Step 3: Create `README.md` with deploy + setup steps**

```markdown
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
```

- [ ] **Step 4: Verify the production build**

Run: `npm run build`
Expected: builds to `dist/` with no errors.
Run: `npm run preview`
Expected: served app works end-to-end locally.

- [ ] **Step 5: Commit**

```bash
git add .gitlab-ci.yml README.md
git commit -m "chore: GitLab Pages CI and setup/deploy docs"
```

---

## Task 22: Final Verification Pass

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: every test passes (Tasks 3–20).

- [ ] **Step 2: Lint/build**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 3: Reduced-motion check**

In DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Confirm transitions are near-instant and particles/parallax are calmed.

- [ ] **Step 4: Contrast spot-check**

At beat 0 (dusk, cream text) and beat last / question (gold, sepia text), verify text is comfortably legible. Adjust the `textColor` threshold in `src/lib/progress.js` if any beat is borderline.

- [ ] **Step 5: Real Telegram end-to-end (after Worker deploy)**

With the Worker deployed and `.env.local` pointing at it: complete a Sí run → confirm the summary lands in Telegram; complete a No run to death → confirm the definitivo message lands. (Manual, requires deploy.)

- [ ] **Step 6: Final commit (if any tweaks were made)**

```bash
git add -A
git commit -m "chore: final verification tweaks"
```

---

## Notes for the Implementer

- **Lottie art is intentionally placeholder.** Every `Character`/`HeartFinale` uses `placeholder.json` so the app runs and tests pass. Dropping real LottieFiles/CC0 art in later is a pure asset swap — the `emotion` interface and imports do not change. See the spec §10 for sources.
- **Never commit** `.env.local` or the bot token. The token lives only as a Worker secret.
- **tsParticles import surface** can differ slightly by version; if `initParticlesEngine`/default export names differ, adjust the import in `Particles.jsx` — the mock in its test pins the contract we rely on.
- **Do not push to GitHub.** Remote is GitLab only.
```
