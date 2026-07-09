#!/usr/bin/env node
// Download a Lottie JSON into src/assets/lottie/<name>.json and validate it.
//
// Usage:
//   node scripts/fetch-lottie.mjs <name> <url>
// where <name> is one of: walk | happy | heart | sad
// and <url> is a LottieFiles JSON URL, e.g. a legacy CDN link
//   https://assets9.lottiefiles.com/packages/lf20_XXXX.json
// or a lottie.host / assets-v2 link (copy from the "Lottie JSON" / "Copy URL" option on the animation page).
//
// After it downloads, just reload `npm run dev` — the registry (src/assets/lottie/index.js) picks it up.

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const VALID = ['walk', 'happy', 'heart', 'sad']
const [, , name, url] = process.argv

if (!VALID.includes(name) || !url) {
  console.error(`Usage: node scripts/fetch-lottie.mjs <${VALID.join('|')}> <url>`)
  process.exit(1)
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'src', 'assets', 'lottie', `${name}.json`)

try {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (!('v' in json) || !Array.isArray(json.layers)) {
    throw new Error('Not a valid Lottie JSON (missing "v" or "layers")')
  }
  await writeFile(dest, JSON.stringify(json))
  console.log(`✓ Saved ${name}.json  (${json.w}x${json.h}, ${json.op} frames, ${json.layers.length} layers)`)
  console.log(`  Reload the dev server to see it.`)
} catch (err) {
  console.error(`✗ Failed: ${err.message}`)
  process.exit(1)
}
