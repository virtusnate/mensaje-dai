# Art — the character sprite & the heart finale

## Character = SVG pixel sprite (no Lottie)

The walking/sad/happy/dead character is a self-contained **pixel-art SVG sprite** defined in
`src/components/Character.jsx` — crisp at any size, no external asset, and deliberately subtle
so the text stays the focus. Emotions map to small pose/tint changes:

| Emotion | Look |
|---------|------|
| `walk` | gentle vertical bob (`.sprite-walk`) |
| `sad-1..4` | eyes drop, desaturated, dimmed, no bob |
| `happy` | arms raised, a small bounce (`.sprite-bounce`) |
| `dead` | figure topples 90° and fades |

To tweak the sprite, edit the `<rect>` "pixels" and the palette constants (`SKIN`, `HAIR`,
`SHIRT`, `PANTS`) at the top of `Character.jsx`. Motion keyframes live in `src/index.css`
(`sprite-bob` / `sprite-bounce`) and are automatically calmed under `prefers-reduced-motion`.

## Heart finale = Lottie

The only Lottie file left is the closing heart (`src/assets/lottie/heart.json`), rendered by
`HeartFinale.jsx`. It's a free LottieFiles animation
(`assets9.lottiefiles.com/packages/lf20_rcuthdnb.json`) — a **candidate**; verify it on
`npm run dev` and swap if you'd like something more on-tone (e.g. a broken→beating heart).

### Swap the heart

1. Find one on LottieFiles (e.g. https://lottiefiles.com/free-animations/beating-heart or
   https://lottiefiles.com/free-animations/broken-heart) and copy its **Lottie JSON URL**
   (`…/packages/lf20_XXXX.json`).
2. Run:
   ```
   node scripts/fetch-lottie.mjs heart https://assets9.lottiefiles.com/packages/lf20_XXXX.json
   ```
3. Reload `npm run dev`.

## Licensing

LottieFiles "Free" animations are free for commercial/personal use; confirm each animation's
license on its page before shipping publicly. The SVG sprite is original to this project.
