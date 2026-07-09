// Lottie art registry — single source of truth mapping story states → animation data.
// To swap any animation: run `node scripts/fetch-lottie.mjs <name> <lottiefiles-json-url>`
// (names: walk | happy | heart | sad), then reload. See docs/LOTTIE.md for sources & curation links.
//
// Current files are BEST-EFFORT candidates chosen without visual preview — verify each on
// `npm run dev` and replace any that don't fit the romantic golden-hour tone.
//   walk  — confident (walking cartoon character)
//   happy — confident (confetti celebration)
//   heart — candidate (square, red-dominant loop) — VERIFY
//   sad   — candidate (portrait character) — reused for sad-1..4 and dead — VERIFY / replace dead with a wilt
import walk from './walk.json'
import happy from './happy.json'
import heart from './heart.json'
import sad from './sad.json'

export const CHARACTER = {
  walk,
  'sad-1': sad,
  'sad-2': sad,
  'sad-3': sad,
  'sad-4': sad,
  happy,
  dead: sad,
}

export const HEART = heart
