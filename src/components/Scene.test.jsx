import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Scene } from './Scene'

describe('Scene', () => {
  it('renders sky, hills and meadow', () => {
    const { getByTestId } = render(<Scene p={0.5} drift={0} />)
    expect(getByTestId('scene-sky').style.background).toContain('linear-gradient')
    expect(getByTestId('scene-hills')).toBeInTheDocument()
    expect(getByTestId('scene-meadow')).toBeInTheDocument()
  })
  it('applies horizontal drift to the parallax layer', () => {
    const { getByTestId } = render(<Scene p={0.5} drift={-20} />)
    expect(getByTestId('scene-parallax').getAttribute('transform')).toContain('-20')
  })
})
