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
