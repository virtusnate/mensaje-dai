import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Scene } from './Scene'

describe('Scene', () => {
  it('renders a sky element with a linear-gradient background from p', () => {
    const { getByTestId } = render(<Scene p={0.5} />)
    const sky = getByTestId('scene-sky')
    expect(sky.style.background).toContain('linear-gradient')
  })

  it('renders hills and meadow layers', () => {
    const { getByTestId } = render(<Scene p={0} />)
    expect(getByTestId('scene-hills')).toBeInTheDocument()
    expect(getByTestId('scene-meadow')).toBeInTheDocument()
  })
})
