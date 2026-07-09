import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('lottie-react', () => ({
  __esModule: true,
  default: () => <div data-testid="lottie-heart" />,
}))

import { HeartFinale } from './HeartFinale'

describe('HeartFinale', () => {
  it('renders the closing message and the heart animation', () => {
    render(<HeartFinale />)
    expect(screen.getByText(/Paso por ti a tu casita/i)).toBeInTheDocument()
    expect(screen.getByTestId('lottie-heart')).toBeInTheDocument()
  })
})
