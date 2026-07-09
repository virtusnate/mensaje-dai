import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressDots } from './ProgressDots'

describe('ProgressDots', () => {
  it('renders one dot per beat', () => {
    render(<ProgressDots total={5} current={2} />)
    expect(screen.getAllByTestId('dot')).toHaveLength(5)
  })

  it('marks the current dot active', () => {
    render(<ProgressDots total={3} current={1} />)
    const dots = screen.getAllByTestId('dot')
    expect(dots[1].dataset.active).toBe('true')
    expect(dots[0].dataset.active).toBe('false')
  })
})
