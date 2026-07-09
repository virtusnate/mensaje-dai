import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Character } from './Character'

describe('Character', () => {
  it('positions itself horizontally from p', () => {
    const { getByTestId } = render(<Character emotion="walk" p={0.5} />)
    expect(getByTestId('character').style.left).toBe('47.5%')
  })

  it('reflects the current emotion on the root element', () => {
    const { getByTestId } = render(<Character emotion="happy" p={0} />)
    expect(getByTestId('character').dataset.emotion).toBe('happy')
  })

  it('renders a self-contained SVG pixel sprite (no external animation)', () => {
    const { container } = render(<Character emotion="walk" p={0} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
