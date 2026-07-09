import { describe, it, expect, vi } from 'vitest'

// The module eagerly imports lottie-react (→ lottie-web, which touches canvas and throws in
// jsdom). Mock it so the module loads; resolveLottie itself is pure and tested directly.
vi.mock('lottie-react', () => ({ __esModule: true, default: () => null }))

import { resolveLottie } from './lottie'

// lottie-react ships a UMD `main` and an ESM `module` with no "exports" map. Vite's dev
// dep-optimizer pre-bundles the UMD build and exposes the module namespace as the default
// import (the component lives at `.default`), while the ESM build / test mocks expose the
// component function directly. resolveLottie must return the component in all three shapes.
describe('resolveLottie', () => {
  it('unwraps the .default when given a UMD/CJS namespace object (Vite dev)', () => {
    const Component = () => null
    const namespace = { default: Component, useLottie: () => {}, __esModule: true }
    expect(resolveLottie(namespace)).toBe(Component)
  })

  it('passes a bare function component through (ESM build / test mock)', () => {
    const Component = () => null
    expect(resolveLottie(Component)).toBe(Component)
  })

  it('passes a forwardRef object (no .default) through unchanged', () => {
    const fwd = { $$typeof: Symbol.for('react.forward_ref'), render: () => null }
    expect(resolveLottie(fwd)).toBe(fwd)
  })
})
