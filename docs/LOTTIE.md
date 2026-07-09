# Lottie Art — sourcing & swapping

The app maps story states to animation files via `src/assets/lottie/index.js`. Each state loads a
local JSON in `src/assets/lottie/`. All current files are **free LottieFiles animations** downloaded
from the public CDN, chosen as best-effort candidates **without visual preview** — verify each on
`npm run dev` and replace any that don't fit the romantic golden-hour tone.

## Current files

| State | File | Source (LottieFiles CDN) | Confidence |
|-------|------|--------------------------|------------|
| `walk` (reading) | `walk.json` | `assets*.lottiefiles.com/packages/lf20_ijpnbqs0.json` | Confident — walking cartoon character |
| `happy` (celebration) | `happy.json` | `assets2.lottiefiles.com/packages/lf20_u4yrau.json` | Confident — confetti celebration |
| heart finale | `heart.json` | `assets9.lottiefiles.com/packages/lf20_rcuthdnb.json` | **Candidate — verify** |
| `sad-1..4` + `dead` | `sad.json` | `assets9.lottiefiles.com/packages/lf20_UJNc2t.json` | **Candidate — verify; give `dead` its own wilt** |

`placeholder.json` remains as the empty fallback.

## How to swap any animation

1. Browse LottieFiles for something you like (these are good, on-tone starting points):
   - Walking character: https://lottiefiles.com/free-animations/walking-cartoon-character
   - Broken / beating heart: https://lottiefiles.com/free-animations/beating-heart · https://lottiefiles.com/free-animations/broken-heart
   - Sad character: https://lottiefiles.com/free-animations/sad · https://lottiefiles.com/free-animations/crying
   - Wilting flower (for `dead`): search "wilt" / "dead flower" on lottiefiles.com
   - Cute character packs (Animal Crossing feel): https://iconscout.com/lottie-animations/animal-crossing
2. On the animation page, copy its **Lottie JSON URL** (legacy CDN links look like
   `https://assets9.lottiefiles.com/packages/lf20_XXXX.json`).
3. Run:
   ```
   node scripts/fetch-lottie.mjs heart https://assets9.lottiefiles.com/packages/lf20_XXXX.json
   ```
   (name = `walk` | `happy` | `heart` | `sad`)
4. Reload `npm run dev`.

## Giving `dead` its own animation (recommended)

Right now `dead` reuses `sad.json`. For a distinct "wilt", add a `dead.json` file and update the
registry: `import dead from './dead.json'` and set `dead` in the `CHARACTER` map. (Add a matching
name to the `VALID` list in `scripts/fetch-lottie.mjs` if you want the helper to fetch it too.)

## Licensing

LottieFiles "Free" animations are free for commercial and personal use; a few request attribution.
Confirm the license on each animation's page before shipping publicly.
