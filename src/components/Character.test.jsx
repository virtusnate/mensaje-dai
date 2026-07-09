import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('lottie-react', () => ({
  __esModule: true,
  default: (props) => <div data-testid="lottie" data-emotion={props['data-emotion']} />,
}))

import { Character } from './Character'

describe('Character', () => {
  it('positions itself horizontally from p', () => {
    const { getByTestId } = render(<Character emotion="walk" p={0.5} />)
    expect(getByTestId('character').style.left).toBe('47.5%')
  })

  it('passes the emotion through', () => {
    const { getByTestId } = render(<Character emotion="happy" p={0} />)
    expect(getByTestId('lottie').dataset.emotion).toBe('happy')
  })
})
