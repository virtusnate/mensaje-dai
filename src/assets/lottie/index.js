// Lottie art registry. The character is now a self-contained SVG pixel sprite
// (see src/components/Character.jsx), so only the heart finale uses a Lottie file.
// To swap the heart: `node scripts/fetch-lottie.mjs heart <lottiefiles-json-url>` then reload.
// See docs/LOTTIE.md for sources & curation links.
import heart from './heart.json'

export const HEART = heart
