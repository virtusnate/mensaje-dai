import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MusicToggle } from './MusicToggle'

// jsdom has no AudioContext, so the engine no-ops; we only verify the toggle UI + label flip.
describe('MusicToggle', () => {
  it('renders a music button (unmuted by default)', () => {
    render(<MusicToggle mood="story" />)
    expect(screen.getByRole('button', { name: /silenciar música/i })).toBeInTheDocument()
  })

  it('flips the label when toggled', async () => {
    render(<MusicToggle mood="story" />)
    await userEvent.click(screen.getByRole('button', { name: /silenciar música/i }))
    expect(screen.getByRole('button', { name: /activar música/i })).toBeInTheDocument()
  })
})
