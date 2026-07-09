import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionCard } from './QuestionCard'

const OPTIONS = ['Este Sábado', 'El próximo Lunes', 'El próximo Viernes']

describe('QuestionCard', () => {
  it('renders the title and preset options', () => {
    render(<QuestionCard title="¿Cuándo puedes?" options={OPTIONS} onAnswer={() => {}} />)
    expect(screen.getByText('¿Cuándo puedes?')).toBeInTheDocument()
    OPTIONS.forEach((o) => expect(screen.getByRole('button', { name: o })).toBeInTheDocument())
  })

  it('calls onAnswer with the chosen preset', async () => {
    const onAnswer = vi.fn()
    render(<QuestionCard title="t" options={OPTIONS} onAnswer={onAnswer} />)
    await userEvent.click(screen.getByRole('button', { name: 'El próximo Lunes' }))
    expect(onAnswer).toHaveBeenCalledWith('El próximo Lunes')
  })

  it('reveals a text field for "Otro" and submits the typed value', async () => {
    const onAnswer = vi.fn()
    render(<QuestionCard title="t" options={OPTIONS} onAnswer={onAnswer} />)
    await userEvent.click(screen.getByRole('button', { name: /otro/i }))
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'El domingo')
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onAnswer).toHaveBeenCalledWith('El domingo')
  })

  it('does not submit an empty "Otro" value', async () => {
    const onAnswer = vi.fn()
    render(<QuestionCard title="t" options={OPTIONS} onAnswer={onAnswer} />)
    await userEvent.click(screen.getByRole('button', { name: /otro/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onAnswer).not.toHaveBeenCalled()
  })
})
