# Emotive Pass ("Light & Bloom") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the existing Última Cita app a cohesive emotive presentation — a man offering a bouquet, grounded and breathing while a pixel landscape drifts behind him, a warm bloom and petals that swell at the question and burst on "Sí", and a somber wilt on "No".

**Architecture:** One pure module (`lib/emotion.js`) is the single source of truth translating `screen + p` into `{ bloom, petalMode, drift }`. `App.jsx` reads it and drives four presentation layers — `Scene` (drift), `Bloom` (new radial glow), `Petals` (new, mode-based), and `Character` (man + bouquet, emotion-driven). No story/logic/Telegram changes.

**Tech Stack:** React 18/19, Vite, Tailwind, Vitest + React Testing Library. Bloom/Petals/Character/Scene are CSS + SVG pixel art (no Lottie — it is removed at the end).

**Baseline:** on branch `main`, 63 tests passing. Create a working branch before starting: `git checkout -b emotive-pass`.

---

## File Map

```
src/
├── lib/
│   └── emotion.js            ← NEW pure: bloomIntensity / petalMode / driftX
├── components/
│   ├── Bloom.jsx             ← NEW radial warm glow (intensity prop)
│   ├── Petals.jsx            ← NEW CSS petal layer (mode: reading|question|burst) — replaces Particles.jsx
│   ├── Particles.jsx         ← DELETE (replaced by Petals)
│   ├── Character.jsx         ← REWRITE: man + offered bouquet, breathing idle, emotion states, `bottom` prop
│   ├── Scene.jsx             ← MODIFY: remove scattered flowers, add progress `drift`
│   ├── StoryText.jsx         ← MODIFY: fix card height so the full body clears it (coordinate with Character)
│   ├── QuestionScreen.jsx    ← MODIFY: add expectant avatar + Bloom + fade-in reveal
│   ├── FloralFinale.jsx      ← NEW (replaces HeartFinale.jsx): pixel floral bloom finale
│   ├── HeartFinale.jsx       ← DELETE
│   ├── NoEscalation.jsx      ← MODIFY: glowing-flower ember on the dead-end
│   └── YesFlow.jsx           ← MODIFY: import FloralFinale
│   └── lib/lottie.js, assets/lottie/*  ← DELETE (Lottie no longer used)
└── App.jsx                   ← MODIFY: drive Bloom/Petals/Scene-drift/zoom from emotion.js; ground the avatar
```

Also `src/index.css`: add `sprite-breathe` keyframes; keep `sprite-sway`.

---

## Task 1: Emotion source-of-truth (pure)

**Files:**
- Create: `src/lib/emotion.js`
- Test: `src/lib/emotion.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/emotion.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { bloomIntensity, petalMode, driftX } from './emotion'

describe('bloomIntensity', () => {
  it('is ~0 early in reading and grows faint by the end', () => {
    expect(bloomIntensity('READING', 0)).toBeCloseTo(0)
    expect(bloomIntensity('READING', 1)).toBeCloseTo(0.35)
  })
  it('swells at the question and flares full on Sí', () => {
    expect(bloomIntensity('QUESTION', 1)).toBe(0.7)
    expect(bloomIntensity('YES_FLOW', 1)).toBe(1)
  })
  it('is 0 (dusk) during the No escalation', () => {
    expect(bloomIntensity('NO_ESCALATION', 1)).toBe(0)
  })
})

describe('petalMode', () => {
  it('maps screen to a petal mode', () => {
    expect(petalMode('READING')).toBe('reading')
    expect(petalMode('QUESTION')).toBe('question')
    expect(petalMode('YES_FLOW')).toBe('burst')
    expect(petalMode('NO_ESCALATION')).toBe('reading')
  })
})

describe('driftX', () => {
  it('drifts the world left as reading progresses', () => {
    expect(driftX(0)).toBe(0)
    expect(driftX(1)).toBe(-40)
    expect(driftX(0.5)).toBe(-20)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- emotion`
Expected: FAIL — `Cannot find module './emotion'`

- [ ] **Step 3: Implement `src/lib/emotion.js`**

```js
// Single source of truth: translate the current screen + reading progress (p, 0..1)
// into the presentation values every visual layer reads.
export function bloomIntensity(screen, p) {
  if (screen === 'YES_FLOW') return 1
  if (screen === 'QUESTION') return 0.7
  if (screen === 'NO_ESCALATION') return 0
  return Math.min(0.35, p * 0.35) // READING: faint, grows with warmth
}

export function petalMode(screen) {
  if (screen === 'YES_FLOW') return 'burst'
  if (screen === 'QUESTION') return 'question'
  return 'reading'
}

export function driftX(p) {
  return -40 * p
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- emotion`
Expected: PASS (3 blocks)

- [ ] **Step 5: Commit**

```bash
git add src/lib/emotion.js src/lib/emotion.test.js
git commit -m "feat: emotion source-of-truth (bloom, petal mode, drift)"
```

---

## Task 2: Bloom layer

**Files:**
- Create: `src/components/Bloom.jsx`
- Test: `src/components/Bloom.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/Bloom.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Bloom } from './Bloom'

describe('Bloom', () => {
  it('is invisible at intensity 0', () => {
    const { getByTestId } = render(<Bloom intensity={0} />)
    expect(getByTestId('bloom').style.opacity).toBe('0')
  })
  it('is fully visible at intensity 1', () => {
    const { getByTestId } = render(<Bloom intensity={1} />)
    expect(getByTestId('bloom').style.opacity).toBe('1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Bloom`
Expected: FAIL — `Cannot find module './Bloom'`

- [ ] **Step 3: Implement `src/components/Bloom.jsx`**

```jsx
// A soft radial warm glow centered behind the avatar. Intensity (0..1) drives opacity + size.
export function Bloom({ intensity }) {
  const size = 40 + intensity * 60 // % of the smaller viewport dimension
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div
        data-testid="bloom"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: '30%',
          width: `${size}vmin`,
          height: `${size}vmin`,
          transform: 'translate(-50%, 50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,240,190,0.9) 0%, rgba(255,240,190,0) 65%)',
          opacity: intensity,
          transition: 'opacity 900ms ease-out, width 900ms ease-out, height 900ms ease-out',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Bloom`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Bloom.jsx src/components/Bloom.test.jsx
git commit -m "feat: Bloom — radial warm glow driven by intensity"
```

---

## Task 3: Petals layer (replaces Particles)

**Files:**
- Create: `src/components/Petals.jsx`
- Test: `src/components/Petals.test.jsx`
- Delete: `src/components/Particles.jsx`, `src/components/Particles.test.jsx`

CSS-driven petals (no tsParticles) so modes and reduced-motion are simple to control.

- [ ] **Step 1: Write the failing test**

`src/components/Petals.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

const reducedMock = vi.fn()
vi.mock('../hooks/useReducedMotion', () => ({ useReducedMotion: () => reducedMock() }))

import { Petals } from './Petals'

describe('Petals', () => {
  it('renders more petals in burst mode than reading mode', () => {
    reducedMock.mockReturnValue(false)
    const { getAllByTestId, rerender } = render(<Petals mode="reading" />)
    const reading = getAllByTestId('petal').length
    rerender(<Petals mode="burst" />)
    const burst = getAllByTestId('petal').length
    expect(burst).toBeGreaterThan(reading)
  })

  it('renders no moving petals when reduced motion is preferred', () => {
    reducedMock.mockReturnValue(true)
    const { queryAllByTestId } = render(<Petals mode="reading" />)
    expect(queryAllByTestId('petal').length).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Petals`
Expected: FAIL — `Cannot find module './Petals'`

- [ ] **Step 3: Implement `src/components/Petals.jsx`**

```jsx
import { useReducedMotion } from '../hooks/useReducedMotion'

const COUNT = { reading: 6, question: 9, burst: 18 }
const TINT = { reading: '#E8B4B8', question: '#F4C99A', burst: '#E8697F' }

export function Petals({ mode }) {
  const reduced = useReducedMotion()
  if (reduced) return null

  const n = COUNT[mode] ?? COUNT.reading
  const color = TINT[mode] ?? TINT.reading
  const dur = mode === 'burst' ? 2.2 : 6

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => {
        const left = (i * 37 + 11) % 100
        const delay = (i * 0.37) % dur
        const size = 4 + (i % 3) * 2
        return (
          <span
            key={i}
            data-testid="petal"
            style={{
              position: 'absolute',
              left: `${left}%`,
              bottom: '-8px',
              width: size,
              height: size,
              borderRadius: '60% 0 60% 0',
              background: color,
              opacity: 0.7,
              animation: `petal-rise ${dur}s linear ${delay}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Add the `petal-rise` keyframes to `src/index.css`**

Append (after the `.sprite-sway` block):
```css
@keyframes petal-rise {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  100% { transform: translateY(-80vh) rotate(220deg); opacity: 0; }
}
```

- [ ] **Step 5: Delete the old particles files**

```bash
git rm src/components/Particles.jsx src/components/Particles.test.jsx
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- Petals`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add src/components/Petals.jsx src/components/Petals.test.jsx src/index.css
git commit -m "feat: Petals layer with modes (reading/question/burst); remove Particles"
```

---

## Task 4: Character — man + offered bouquet + breathing idle

**Files:**
- Rewrite: `src/components/Character.jsx`
- Rewrite: `src/components/Character.test.jsx`

Grounded, centered, at a `bottom` the caller chooses (default `34%` so he stands on the reading panel's top edge). Idle = subtle breathing (no walk, no bob). Emotion drives pose/tint and the bouquet state.

- [ ] **Step 1: Write the failing test**

`src/components/Character.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Character } from './Character'

describe('Character', () => {
  it('is grounded (default bottom 34%) and centered', () => {
    const { getByTestId } = render(<Character emotion="walk" />)
    const el = getByTestId('character')
    expect(el.style.left).toBe('50%')
    expect(el.style.bottom).toBe('34%')
  })

  it('accepts a custom bottom', () => {
    const { getByTestId } = render(<Character emotion="walk" bottom="56%" />)
    expect(getByTestId('character').style.bottom).toBe('56%')
  })

  it('reflects the emotion and shows the bouquet while alive', () => {
    const { getByTestId } = render(<Character emotion="walk" />)
    expect(getByTestId('character').dataset.emotion).toBe('walk')
    expect(getByTestId('bouquet')).toBeInTheDocument()
  })

  it('drops the bouquet when dead', () => {
    const { queryByTestId } = render(<Character emotion="dead" />)
    expect(queryByTestId('bouquet')).not.toBeInTheDocument()
  })

  it('breathes only while idle (walk), not when happy', () => {
    const { getByTestId, rerender } = render(<Character emotion="walk" />)
    expect(getByTestId('sprite-anim').className).toContain('sprite-breathe')
    rerender(<Character emotion="happy" />)
    expect(getByTestId('sprite-anim').className).toContain('sprite-sway')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Character`
Expected: FAIL (assertions/`sprite-anim` testid missing)

- [ ] **Step 3: Implement `src/components/Character.jsx`**

```jsx
// Pixel-art man who offers a bouquet. Grounded + centered; subtle breathing while idle
// (no walk cycle, no bob). Emotion drives pose/tint and the bouquet's state. `dead` topples him.
const SKIN = '#F0C39B'
const HAIR = '#3A2A20'
const SHIRT = '#456B86'
const PANTS = '#33324A'
const INK = '#2C1A0E'
const STEM = '#4A6B3E'

function Bouquet({ state }) {
  // state: 'fresh' | 'open' | 'wilt'
  const tops = state === 'wilt'
    ? ['#7A6A72', '#6A6458', '#7A6A72']
    : ['#E8697F', '#FBF3DE', '#F4C36A']
  const y = state === 'wilt' ? 6 : state === 'open' ? 3 : 4
  return (
    <g data-testid="bouquet">
      <rect x="5" y="7" width="1" height="3" fill={STEM} />
      <rect x="6" y="7" width="1" height="3" fill={STEM} />
      <rect x="4" y={y} width="1" height="1" fill={tops[0]} />
      <rect x="6" y={y - 1} width="1" height="1" fill={tops[1]} />
      <rect x="8" y={y} width="1" height="1" fill={tops[2]} />
    </g>
  )
}

export function Character({ emotion, bottom = '34%' }) {
  const sad = String(emotion).startsWith('sad')
  const dead = emotion === 'dead'
  const happy = emotion === 'happy'
  const bouquetState = dead || sad ? 'wilt' : happy ? 'open' : 'fresh'
  const animClass = dead ? '' : happy ? 'sprite-sway' : 'sprite-breathe'

  return (
    <div
      data-testid="character"
      data-emotion={emotion}
      className="absolute"
      style={{
        left: '50%',
        bottom,
        width: 48,
        height: 66,
        transform: 'translateX(-50%)',
        transition: 'bottom 900ms ease-out, opacity 900ms ease-out',
        opacity: dead ? 0.5 : sad ? 0.85 : 1,
        filter: sad || dead ? 'saturate(0.55)' : 'none',
      }}
      aria-hidden="true"
    >
      <div
        data-testid="sprite-anim"
        className={animClass}
        style={{
          width: '100%',
          height: '100%',
          transform: dead ? 'rotate(90deg)' : 'none',
          transformOrigin: 'center bottom',
          transition: 'transform 600ms ease-out',
        }}
      >
        <svg viewBox="0 0 12 16" width="100%" height="100%" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
          {/* hair + head */}
          <rect x="3" y="0" width="6" height="2" fill={HAIR} />
          <rect x="4" y="1" width="4" height="3" fill={SKIN} />
          <rect x="5" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          <rect x="7" y={sad || dead ? 3 : 2} width="1" height="1" fill={INK} />
          {/* shirt */}
          <rect x="4" y="4" width="4" height="5" fill={SHIRT} />
          {/* arms: raised when happy, forward (offering) otherwise */}
          {happy ? (
            <>
              <rect x="2" y="2" width="1" height="3" fill={SKIN} />
              <rect x="9" y="2" width="1" height="3" fill={SKIN} />
            </>
          ) : (
            <>
              <rect x="3" y="5" width="1" height="2" fill={SKIN} />
              <rect x="8" y="5" width="1" height="2" fill={SKIN} />
            </>
          )}
          {/* legs + feet */}
          <rect x="4" y="9" width="1" height="4" fill={PANTS} />
          <rect x="7" y="9" width="1" height="4" fill={PANTS} />
          <rect x="4" y="13" width="2" height="1" fill={INK} />
          <rect x="6" y="13" width="2" height="1" fill={INK} />
          {/* the bouquet he offers (dropped when dead) */}
          {!dead && <Bouquet state={bouquetState} />}
        </svg>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add `sprite-breathe` keyframes to `src/index.css`**

Append near `.sprite-sway`:
```css
@keyframes sprite-breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5px); }
}
.sprite-breathe { animation: sprite-breathe 3s ease-in-out infinite; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Character`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/Character.jsx src/components/Character.test.jsx src/index.css
git commit -m "feat: Character — man offering a bouquet, breathing idle, emotion states"
```

---

## Task 5: Scene — remove flowers, add drift

**Files:**
- Modify: `src/components/Scene.jsx`
- Modify: `src/components/Scene.test.jsx`

- [ ] **Step 1: Add a failing test for drift + no flowers**

Replace `src/components/Scene.test.jsx` with:
```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Scene } from './Scene'

describe('Scene', () => {
  it('renders sky, hills and meadow', () => {
    const { getByTestId } = render(<Scene p={0.5} drift={0} />)
    expect(getByTestId('scene-sky').style.background).toContain('linear-gradient')
    expect(getByTestId('scene-hills')).toBeInTheDocument()
    expect(getByTestId('scene-meadow')).toBeInTheDocument()
  })

  it('applies horizontal drift to the parallax layer', () => {
    const { getByTestId } = render(<Scene p={0.5} drift={-20} />)
    expect(getByTestId('scene-parallax').getAttribute('transform')).toContain('-20')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Scene`
Expected: FAIL (`scene-parallax` missing)

- [ ] **Step 3: Edit `src/components/Scene.jsx`**

Remove the `FLOWERS` constant and the flowers `.map(...)` block entirely. Add a `drift` prop (default 0) and wrap the sun + hills + meadow in a `<g data-testid="scene-parallax" transform={...}>`. The updated signature and SVG body:

```jsx
export function Scene({ p, drift = 0 }) {
  const sunColor = mixHex('#E8965E', '#FFE39A', p)
  const backHill = mixHex('#7E8B93', '#E6B87A', p)
  const frontHill = mixHex('#4A5A4E', '#89A05A', p)
  const meadow = mixHex('#3E4A38', '#6E8B4E', p)
  const sunY = lerp(52, 34, p)
  const starOpacity = Math.max(0, 1 - p * 1.6)

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        data-testid="scene-sky"
        className="absolute inset-0"
        style={{ background: skyGradient(p), transition: 'background 900ms ease-out' }}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 120 90"
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
      >
        <g style={{ opacity: starOpacity, transition: 'opacity 900ms ease-out' }}>
          {STARS.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="1" height="1" fill="#FBF3DE" />
          ))}
        </g>
        <g data-testid="scene-parallax" transform={`translate(${drift} 0)`} style={{ transition: 'transform 900ms linear' }}>
          <g style={{ transition: 'all 900ms ease-out' }}>{pixelSun(60, sunY, sunColor)}</g>
          <g data-testid="scene-hills">{pixelHill(70, 14, 26, 1.3, backHill, 'b')}</g>
          <g>{pixelHill(78, 12, 15, 4.2, frontHill, 'f')}</g>
          <rect data-testid="scene-meadow" x="-40" y="82" width="200" height="8" fill={meadow} />
        </g>
      </svg>
    </div>
  )
}
```

(The meadow/parallax group is widened to `x=-40 width=200` so the drift never exposes an edge. Delete the old `FLOWERS` const and its map.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Scene`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Scene.jsx src/components/Scene.test.jsx
git commit -m "feat: Scene — remove scattered flowers, add parallax drift"
```

---

## Task 6: StoryText — coordinate card height with the grounded avatar

**Files:**
- Modify: `src/components/StoryText.jsx`

The card `minHeight` becomes `34%` so the avatar standing at `bottom:34%` clears it with the full body above. (No behavior change; existing StoryText tests still pass.)

- [ ] **Step 1: Edit `src/components/StoryText.jsx`**

Change the card wrapper's `minHeight` from `'44%'` to `'34%'`, and swap the `♥` ornament for a flower. In the ornament block, replace the heart span with:
```jsx
<span style={{ color: '#8AA05A', fontSize: 12 }}>✿</span>
```
And in the card style object set `minHeight: '34%'`.

- [ ] **Step 2: Run tests to verify nothing broke**

Run: `npm test -- StoryText`
Expected: PASS (existing 4 tests)

- [ ] **Step 3: Commit**

```bash
git add src/components/StoryText.jsx
git commit -m "feat: StoryText — shorter card so full avatar clears it, flower ornament"
```

---

## Task 7: FloralFinale (replaces HeartFinale)

**Files:**
- Create: `src/components/FloralFinale.jsx`
- Create: `src/components/FloralFinale.test.jsx`
- Delete: `src/components/HeartFinale.jsx`, `src/components/HeartFinale.test.jsx`
- Modify: `src/components/YesFlow.jsx` (import)

- [ ] **Step 1: Write the failing test**

`src/components/FloralFinale.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloralFinale } from './FloralFinale'

describe('FloralFinale', () => {
  it('renders the closing message and a floral bloom (svg)', () => {
    const { container } = render(<FloralFinale />)
    expect(screen.getByText(/Paso por ti a tu casita/i)).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- FloralFinale`
Expected: FAIL — `Cannot find module './FloralFinale'`

- [ ] **Step 3: Implement `src/components/FloralFinale.jsx`**

```jsx
// Closing beat: a pixel floral bloom (no Lottie) + the closing line.
const PETAL = ['#E8697F', '#FBF3DE', '#F4C36A', '#E8B4B8']

export function FloralFinale() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <svg width="120" height="120" viewBox="0 0 12 12" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }} aria-hidden="true" className="sprite-sway">
        <rect x="5" y="5" width="2" height="2" fill="#F4C36A" />
        <rect x="5" y="2" width="2" height="2" fill={PETAL[0]} />
        <rect x="5" y="8" width="2" height="2" fill={PETAL[3]} />
        <rect x="2" y="5" width="2" height="2" fill={PETAL[1]} />
        <rect x="8" y="5" width="2" height="2" fill={PETAL[2]} />
      </svg>
      <p className="font-body text-3xl italic mt-6 max-w-sm" style={{ color: 'var(--sepia)' }}>
        Paso por ti a tu casita y de ahí nos vamos juntos 🌸
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Update `src/components/YesFlow.jsx` and its test**

Change the import and usage from `HeartFinale` to `FloralFinale`:
```jsx
import { FloralFinale } from './FloralFinale'
// ...
{step === 'finale' && <FloralFinale />}
```

Then in `src/components/YesFlow.test.jsx`, **remove the `vi.mock('lottie-react', ...)` line entirely** (YesFlow no longer imports Lottie; leaving the mock would error once `lottie-react` is uninstalled in Task 11). Keep the `../lib/notify` mock. The test assertions are unchanged.

- [ ] **Step 5: Delete the old finale**

```bash
git rm src/components/HeartFinale.jsx src/components/HeartFinale.test.jsx
```

- [ ] **Step 6: Run tests to verify**

Run: `npm test -- FloralFinale YesFlow`
Expected: PASS (FloralFinale 1, YesFlow existing test still green — it asserts `/Paso por ti a tu casita/i`)

- [ ] **Step 7: Commit**

```bash
git add src/components/FloralFinale.jsx src/components/FloralFinale.test.jsx src/components/YesFlow.jsx
git commit -m "feat: FloralFinale replaces HeartFinale (floral bloom, no Lottie)"
```

---

## Task 8: NoEscalation — glowing-flower ember on the dead-end

**Files:**
- Modify: `src/components/NoEscalation.jsx`

The dead-end already shows a `Character emotion="dead"` (topples, drops bouquet — from Task 4) and a lingering "…¿Sí?". Add a single glowing-flower ember above the button and remove the placeholder "…" paragraph.

- [ ] **Step 1: Add a failing test**

Append to `src/components/NoEscalation.test.jsx` (inside the top-level `describe`):
```jsx
  it('shows a glowing-flower ember on the dead-end', async () => {
    render(<NoEscalation onDead={() => {}} onYes={() => {}} />)
    await tapNoTimes(8)
    expect(screen.getByTestId('ember')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- NoEscalation`
Expected: FAIL (`ember` not found)

- [ ] **Step 3: Edit the dead branch in `src/components/NoEscalation.jsx`**

Replace the dead-branch block:
```jsx
        <div className="relative z-10 mt-24">
          <p className="font-script text-3xl mb-8" style={{ color: 'var(--cream)' }}>
            {'…'}
          </p>
          <button
            onClick={onYes}
```
with:
```jsx
        <div className="relative z-10 mt-24 flex flex-col items-center">
          <span
            data-testid="ember"
            className="mb-6"
            style={{ color: '#F4C36A', fontSize: 22, textShadow: '0 0 10px #F4C36A' }}
          >
            ✿
          </span>
          <button
            onClick={onYes}
```
(keep the rest of the button unchanged).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- NoEscalation`
Expected: PASS (existing 4 + new = 5)

- [ ] **Step 5: Commit**

```bash
git add src/components/NoEscalation.jsx src/components/NoEscalation.test.jsx
git commit -m "feat: NoEscalation — glowing-flower ember on the dead-end"
```

---

## Task 9: QuestionScreen — expectant avatar + bloom + reveal

**Files:**
- Modify: `src/components/QuestionScreen.jsx`
- Modify: `src/components/QuestionScreen.test.jsx`

- [ ] **Step 1: Add a failing test for the avatar**

Add to `src/components/QuestionScreen.test.jsx` (inside the `describe`):
```jsx
  it('shows the expectant avatar waiting', () => {
    render(<QuestionScreen onYes={() => {}} onNo={() => {}} />)
    expect(screen.getByTestId('character')).toBeInTheDocument()
  })
```
(Ensure the file imports are present: `render`, `screen`, `userEvent`, `vi`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- QuestionScreen`
Expected: FAIL (`character` not found)

- [ ] **Step 3: Edit `src/components/QuestionScreen.jsx`**

Add the avatar (positioned above the card) and a bloom behind it. Buttons + card stay in the DOM (fade-in via CSS so tests find them synchronously). New file:
```jsx
import { Character } from './Character'
import { Bloom } from './Bloom'

export function QuestionScreen({ onYes, onNo }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <Bloom intensity={0.7} />
      <Character emotion="walk" bottom="56%" />
      <div
        className="max-w-sm w-full px-7 py-8 rounded-3xl relative z-10"
        style={{
          background: 'linear-gradient(180deg,#FDF7E6,#F3E4C6)',
          border: '2px solid rgba(212,165,116,0.7)',
          boxShadow: '0 12px 40px rgba(44,26,14,0.3)',
          color: 'var(--sepia)',
          animation: 'fade-rise 700ms ease-out both',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
          <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
          <span style={{ color: '#C86B5A', fontSize: 12 }}>✿</span>
          <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
        </div>
        <h1 className="font-body text-3xl md:text-4xl italic leading-snug mb-8">
          ¿Quieres salir conmigo una vez más a la cineteca de Chapultepec?
        </h1>
        <div className="flex gap-5 items-center justify-center">
          <button onClick={onYes} className="px-8 py-3 rounded-full text-white font-body text-lg" style={{ background: 'var(--coral)', minHeight: '44px' }}>Sí</button>
          <button onClick={onNo} className="px-8 py-3 rounded-full text-white font-body text-lg" style={{ background: 'var(--muted-rose)', minHeight: '44px' }}>No</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add `fade-rise` keyframes to `src/index.css`**

```css
@keyframes fade-rise {
  0% { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 5: Run tests to verify**

Run: `npm test -- QuestionScreen`
Expected: PASS (existing 2 + avatar = 3)

- [ ] **Step 6: Commit**

```bash
git add src/components/QuestionScreen.jsx src/components/QuestionScreen.test.jsx src/index.css
git commit -m "feat: QuestionScreen — expectant avatar + bloom + fade-in reveal"
```

---

## Task 10: App integration — drive everything from emotion.js

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Update the App test mock (Particles → Petals)**

In `src/App.test.jsx`, change the Particles mock to Petals:
```jsx
vi.mock('./components/Petals', () => ({ Petals: () => <div data-testid="petals" /> }))
```
Remove the old `vi.mock('./components/Particles', ...)` line. Also **remove the `vi.mock('lottie-react', ...)` line** — Lottie is gone (and gets uninstalled in Task 11, which would make mocking it error). Keep the `./lib/notify` mock and the existing four App flow tests unchanged.

- [ ] **Step 2: Run the App test to verify it fails**

Run: `npm test -- App`
Expected: FAIL (App still imports Particles / old Character signature)

- [ ] **Step 3: Edit `src/App.jsx`**

Wire the new layers. Replace imports and the render body:
```jsx
import { useState } from 'react'
import { STORY } from './content/story'
import { Scene } from './components/Scene'
import { Petals } from './components/Petals'
import { Bloom } from './components/Bloom'
import { Character } from './components/Character'
import { StoryText } from './components/StoryText'
import { ProgressDots } from './components/ProgressDots'
import { QuestionScreen } from './components/QuestionScreen'
import { NoEscalation } from './components/NoEscalation'
import { YesFlow } from './components/YesFlow'
import { notify } from './lib/notify'
import { lerp } from './lib/progress'
import { bloomIntensity, petalMode, driftX } from './lib/emotion'

const READING = 'READING'
const QUESTION = 'QUESTION'
const YES_FLOW = 'YES_FLOW'
const NO_ESCALATION = 'NO_ESCALATION'

export default function App() {
  const [screen, setScreen] = useState(READING)
  const [beat, setBeat] = useState(0)
  const [noDead, setNoDead] = useState(false)

  const total = STORY.length
  const readingP = total > 1 ? beat / (total - 1) : 1
  const p =
    screen === READING ? readingP
    : screen === NO_ESCALATION && noDead ? 0.1
    : 1

  const bloom = bloomIntensity(screen, p)
  const petals = petalMode(screen)
  const drift = screen === READING ? driftX(readingP) : driftX(1)

  function advance() {
    if (beat < total - 1) setBeat((b) => b + 1)
    else setScreen(QUESTION)
  }

  return (
    <div className="relative mx-auto overflow-hidden" style={{ maxWidth: 480, height: '100dvh', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ transform: `scale(${lerp(1, 1.4, p)})`, transformOrigin: '50% 45%', transition: 'transform 900ms ease-out' }}
      >
        <Scene p={p} drift={drift} />
        {screen === READING && <Character emotion="walk" />}
      </div>

      <Bloom intensity={screen === QUESTION ? 0 : bloom} />
      <Petals mode={petals} />

      {screen === READING && (
        <>
          <ProgressDots total={total} current={beat} />
          <StoryText text={STORY[beat]} onAdvance={advance} />
        </>
      )}

      {screen === QUESTION && (
        <QuestionScreen onYes={() => setScreen(YES_FLOW)} onNo={() => setScreen(NO_ESCALATION)} />
      )}

      {screen === NO_ESCALATION && (
        <NoEscalation onDead={() => { notify({ kind: 'no' }); setNoDead(true) }} onYes={() => setScreen(YES_FLOW)} />
      )}

      {screen === YES_FLOW && <YesFlow />}
    </div>
  )
}
```
(Note: `QuestionScreen` renders its own `Bloom` at 0.7, so App suppresses its bloom on the QUESTION screen via `screen === QUESTION ? 0 : bloom` to avoid double-glow. `YES_FLOW` keeps App's full bloom flare behind `YesFlow`.)

- [ ] **Step 4: Run the App test to verify it passes**

Run: `npm test -- App`
Expected: PASS (4 flow tests)

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: App — drive bloom/petals/drift/zoom from emotion.js; ground avatar"
```

---

## Task 11: Remove the now-unused Lottie stack

**Files:**
- Delete: `src/lib/lottie.js`, `src/lib/lottie.test.js`, `src/assets/lottie/index.js`, `src/assets/lottie/heart.json`, `src/assets/lottie/placeholder.json`
- Modify: `package.json` (remove `lottie-react`)

- [ ] **Step 1: Confirm nothing imports lottie anymore**

Run: `grep -rn "lottie" src/` (PowerShell: `Select-String -Path src\* -Pattern lottie -Recurse`)
Expected: no matches (FloralFinale is pure SVG; Character is pure SVG). If any remain, fix before continuing.

- [ ] **Step 2: Delete the files and dependency**

```bash
git rm src/lib/lottie.js src/lib/lottie.test.js src/assets/lottie/index.js src/assets/lottie/heart.json src/assets/lottie/placeholder.json
npm uninstall lottie-react
```

- [ ] **Step 3: Run the full suite + build**

Run: `npm test`
Expected: all green (the removed `lottie.test.js` simply no longer runs).
Run: `npm run build`
Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused Lottie stack (finale + character are pure SVG now)"
```

---

## Task 12: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: every test passes.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: clean build (bundle should shrink — lottie/tsparticles removed).

- [ ] **Step 3: Reduced-motion check**

DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Confirm: no breathing, no petals, no drift/zoom animation, no burst — calm static states. (Global CSS calms transitions; `Petals` returns null.)

- [ ] **Step 4: Manual walkthrough (dev server)**

Run: `npm run dev`. Verify the four beats: reading (full man, breathing, world drifts, sparse petals), question (bloom + avatar lifting bouquet + fade-in card), Sí (petal burst + bloom flare + floral finale), No→death (wilt + topple + glowing ember + lingering Sí).

- [ ] **Step 5: Finish the branch**

Use superpowers:finishing-a-development-branch to merge `emotive-pass` into `main`.

---

## Notes for the Implementer

- **One source of truth:** `lib/emotion.js` is pure and tested; App is the only place that maps state → layer props. Don't scatter magic numbers into components.
- **Reduced motion:** `Petals` returns null; breathing/sway/drift/zoom are CSS transitions/animations already calmed by the global `prefers-reduced-motion` rule. If you add new motion, respect it.
- **tsParticles was already replaced by CSS Petals** — do not reintroduce it. Lottie is removed in Task 11; the finale and character are pure SVG.
- **Don't touch** story text, branching logic, Telegram/Worker, or hosting.
