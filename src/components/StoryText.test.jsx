import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoryText } from './StoryText'

describe('StoryText', () => {
  it('shows the current beat text', () => {
    render(<StoryText text="Hola mundo" p={0} onAdvance={() => {}} />)
    expect(screen.getByText('Hola mundo')).toBeInTheDocument()
  })

  it('uses an aria-live region for the beat', () => {
    render(<StoryText text="Beat" p={0} onAdvance={() => {}} />)
    expect(screen.getByTestId('beat-live')).toHaveAttribute('aria-live', 'polite')
  })

  it('calls onAdvance when tapped', async () => {
    const onAdvance = vi.fn()
    render(<StoryText text="Beat" p={0} onAdvance={onAdvance} />)
    await userEvent.click(screen.getByTestId('advance-zone'))
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('calls onAdvance on Enter / Space / ArrowRight', async () => {
    const onAdvance = vi.fn()
    render(<StoryText text="Beat" p={0} onAdvance={onAdvance} />)
    const zone = screen.getByTestId('advance-zone')
    zone.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowRight}')
    expect(onAdvance).toHaveBeenCalledTimes(3)
  })
})
