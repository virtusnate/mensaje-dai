import LottieImport from 'lottie-react'

// lottie-react ships a UMD `main` and an ESM `module` build with no "exports" map.
// Vite's dev dep-optimizer pre-bundles the UMD build and exposes the whole module namespace
// as the default import — so the component lives at `.default` in dev, but is the default
// itself in the production ESM build (and in test mocks). Normalize so every environment
// gets the actual component and `<Lottie>` never receives a plain object.
export function resolveLottie(mod) {
  return mod && mod.default ? mod.default : mod
}

export const Lottie = resolveLottie(LottieImport)
