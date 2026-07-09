import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WarningModal } from './WarningModal'

describe('WarningModal', () => {
  it('shows the message', () => {
    render(<WarningModal message="Última oportunidad" onClose={() => {}} />)
    expect(screen.getByText('Última oportunidad')).toBeInTheDocument()
  })

  it('calls onClose when the button is clicked', async () => {
    const onClose = vi.fn()
    render(<WarningModal message="x" onClose={onClose} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('has role="alertdialog"', () => {
    render(<WarningModal message="x" onClose={() => {}} />)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
