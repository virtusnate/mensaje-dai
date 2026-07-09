import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Character } from './Character'

describe('Character', () => {
  it('is grounded (default bottom 34%) and centered', () => {
    const { getByTestId } = render(<Character emotion="walk" />)
    const el = getByTestId('character')
    expect(el.style.left).toBe('50%')
    expect(el.style.bottom).toBe('34%')
  })
  it('accepts a custom bottom', () => {
    const { getByTestId } = render(<Character emotion="walk" bottom="56%" />)
    expect(getByTestId('character').style.bottom).toBe('56%')
  })
  it('reflects the emotion and shows the bouquet while alive', () => {
    const { getByTestId } = render(<Character emotion="walk" />)
    expect(getByTestId('character').dataset.emotion).toBe('walk')
    expect(getByTestId('bouquet')).toBeInTheDocument()
  })
  it('drops the bouquet when dead', () => {
    const { queryByTestId } = render(<Character emotion="dead" />)
    expect(queryByTestId('bouquet')).not.toBeInTheDocument()
  })
  it('breathes only while idle (walk), not when happy', () => {
    const { getByTestId, rerender } = render(<Character emotion="walk" />)
    expect(getByTestId('sprite-anim').className).toContain('sprite-breathe')
    rerender(<Character emotion="happy" />)
    expect(getByTestId('sprite-anim').className).toContain('sprite-sway')
  })
})
