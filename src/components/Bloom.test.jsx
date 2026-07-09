import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Bloom } from './Bloom'

describe('Bloom', () => {
  it('is invisible at intensity 0', () => {
    const { getByTestId } = render(<Bloom intensity={0} />)
    expect(getByTestId('bloom').style.opacity).toBe('0')
  })
  it('is fully visible at intensity 1', () => {
    const { getByTestId } = render(<Bloom intensity={1} />)
    expect(getByTestId('bloom').style.opacity).toBe('1')
  })
})
