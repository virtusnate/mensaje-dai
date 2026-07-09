import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionScreen } from './QuestionScreen'

describe('QuestionScreen', () => {
  it('shows the invitation question', () => {
    render(<QuestionScreen onYes={() => {}} onNo={() => {}} />)
    expect(screen.getByText(/cineteca de Chapultepec/i)).toBeInTheDocument()
  })

  it('calls onYes / onNo', async () => {
    const onYes = vi.fn()
    const onNo = vi.fn()
    render(<QuestionScreen onYes={onYes} onNo={onNo} />)
    await userEvent.click(screen.getByRole('button', { name: /^sí$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^no$/i }))
    expect(onYes).toHaveBeenCalled()
    expect(onNo).toHaveBeenCalled()
  })
})
