import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@tsparticles/react', () => ({
  __esModule: true,
  initParticlesEngine: vi.fn().mockResolvedValue(undefined),
  ParticlesProvider: ({ children }) => <>{children}</>,
  default: (props) => <div data-testid="tsparticles" data-options={JSON.stringify(props.options)} />,
}))
vi.mock('@tsparticles/slim', () => ({ loadSlim: vi.fn() }))

const reducedMock = vi.fn()
vi.mock('../hooks/useReducedMotion', () => ({ useReducedMotion: () => reducedMock() }))

import { Particles } from './Particles'

describe('Particles', () => {
  it('renders the particles container', async () => {
    reducedMock.mockReturnValue(false)
    const { findByTestId } = render(<Particles p={0.2} />)
    expect(await findByTestId('tsparticles')).toBeInTheDocument()
  })

  it('warms particle color as p increases', async () => {
    reducedMock.mockReturnValue(false)
    const { findByTestId, rerender } = render(<Particles p={0} />)
    const cold = JSON.parse((await findByTestId('tsparticles')).dataset.options)
    rerender(<Particles p={1} />)
    const warm = JSON.parse((await findByTestId('tsparticles')).dataset.options)
    expect(cold.particles.color.value).not.toBe(warm.particles.color.value)
  })

  it('disables particle movement when reduced motion is preferred', async () => {
    reducedMock.mockReturnValue(true)
    const { findByTestId } = render(<Particles p={0.5} />)
    const opts = JSON.parse((await findByTestId('tsparticles')).dataset.options)
    expect(opts.particles.move.enable).toBe(false)
  })
})
