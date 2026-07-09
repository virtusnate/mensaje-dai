import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloralFinale } from './FloralFinale'

describe('FloralFinale', () => {
  it('renders the closing message and a floral bloom (svg)', () => {
    const { container } = render(<FloralFinale />)
    expect(screen.getByText(/Paso por ti a tu casita/i)).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
