import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('lottie-react', () => ({
  __esModule: true,
  default: () => <div data-testid="lottie" />,
}))

import { NoEscalation } from './NoEscalation'

async function tapNoTimes(n) {
  for (let i = 0; i < n; i++) {
    await userEvent.click(screen.getByRole('button', { name: /^no$/i }))
    const dismiss = screen.queryByRole('button', { name: /entiendo/i })
    if (dismiss) await userEvent.click(dismiss)
  }
}

describe('NoEscalation', () => {
  it('shows warning 1 at the 5th No', async () => {
    render(<NoEscalation onDead={() => {}} onYes={() => {}} />)
    await tapNoTimes(5)
    expect(screen.getByText('2 veces más y será definitivo')).toBeInTheDocument()
  })

  it('calls onDead at the 8th No and shows the lingering Sí', async () => {
    const onDead = vi.fn()
    render(<NoEscalation onDead={onDead} onYes={() => {}} />)
    await tapNoTimes(8)
    expect(onDead).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /sí/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^no$/i })).not.toBeInTheDocument()
  })

  it('lingering Sí after death calls onYes', async () => {
    const onYes = vi.fn()
    render(<NoEscalation onDead={() => {}} onYes={onYes} />)
    await tapNoTimes(8)
    await userEvent.click(screen.getByRole('button', { name: /sí/i }))
    expect(onYes).toHaveBeenCalled()
  })

  it('the Sí button is present throughout and calls onYes before death', async () => {
    const onYes = vi.fn()
    render(<NoEscalation onDead={() => {}} onYes={onYes} />)
    await tapNoTimes(2)
    await userEvent.click(screen.getByRole('button', { name: /^sí$/i }))
    expect(onYes).toHaveBeenCalled()
  })

  it('shows a glowing-flower ember on the dead-end', async () => {
    render(<NoEscalation onDead={() => {}} onYes={() => {}} />)
    await tapNoTimes(8)
    expect(screen.getByTestId('ember')).toBeInTheDocument()
  })
})
