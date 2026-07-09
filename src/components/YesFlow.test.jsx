import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../lib/notify', () => ({ notify: vi.fn().mockResolvedValue(undefined) }))

import { YesFlow } from './YesFlow'
import { notify } from '../lib/notify'

describe('YesFlow', () => {
  beforeEach(() => notify.mockClear())

  it('asks when, then time, then sends one summary and shows the finale', async () => {
    render(<YesFlow />)

    expect(screen.getByText(/¿Cuándo puedes\?/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Este Sábado' }))

    expect(screen.getByText(/¿A qué hora/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '3 pm' }))

    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith({ kind: 'yes', cuando: 'Este Sábado', hora: '3 pm' })

    expect(screen.getByText(/Paso por ti a tu casita/i)).toBeInTheDocument()
  })
})
