import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./lib/notify', () => ({ notify: vi.fn().mockResolvedValue(undefined) }))
vi.mock('lottie-react', () => ({ __esModule: true, default: () => <div data-testid="lottie" /> }))
vi.mock('./components/Particles', () => ({ Particles: () => <div data-testid="particles" /> }))

import App from './App'
import { STORY } from './content/story'

async function advanceThroughStory() {
  for (let i = 0; i < STORY.length; i++) {
    await userEvent.click(screen.getByTestId('advance-zone'))
  }
}

describe('App', () => {
  it('starts on the first beat of the story', () => {
    render(<App />)
    expect(screen.getByText(STORY[0])).toBeInTheDocument()
  })

  it('reaches the question after the last beat', async () => {
    render(<App />)
    await advanceThroughStory()
    expect(screen.getByText(/cineteca de Chapultepec/i)).toBeInTheDocument()
  })

  it('Sí leads into the Yes flow', async () => {
    render(<App />)
    await advanceThroughStory()
    await userEvent.click(screen.getByRole('button', { name: /^sí$/i }))
    expect(screen.getByText(/¿Cuándo puedes\?/i)).toBeInTheDocument()
  })

  it('No leads into the escalation', async () => {
    render(<App />)
    await advanceThroughStory()
    await userEvent.click(screen.getByRole('button', { name: /^no$/i }))
    expect(screen.getAllByRole('button', { name: /^(sí|no)$/i }).length).toBeGreaterThanOrEqual(2)
  })
})
