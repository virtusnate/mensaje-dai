import { describe, it, expect } from 'vitest'
import { initialNoState, tapNo, sadnessStage, noScale, yesScale } from './noMachine'

describe('noMachine', () => {
  it('starts at count 0, alive, no modal', () => {
    const s = initialNoState()
    expect(s).toEqual({ count: 0, dead: false, modal: null })
  })

  it('increments count and shows no modal for taps 1-4', () => {
    let s = initialNoState()
    for (let i = 0; i < 4; i++) s = tapNo(s)
    expect(s.count).toBe(4)
    expect(s.modal).toBe(null)
    expect(s.dead).toBe(false)
  })

  it('shows warning 1 at tap 5', () => {
    let s = initialNoState()
    for (let i = 0; i < 5; i++) s = tapNo(s)
    expect(s.count).toBe(5)
    expect(s.modal).toBe('2 veces más y será definitivo')
  })

  it('shows warning 2 at tap 7', () => {
    let s = initialNoState()
    for (let i = 0; i < 7; i++) s = tapNo(s)
    expect(s.count).toBe(7)
    expect(s.modal).toBe('Última oportunidad')
  })

  it('dies at tap 8', () => {
    let s = initialNoState()
    for (let i = 0; i < 8; i++) s = tapNo(s)
    expect(s.count).toBe(8)
    expect(s.dead).toBe(true)
  })

  it('ignores further taps once dead', () => {
    let s = initialNoState()
    for (let i = 0; i < 10; i++) s = tapNo(s)
    expect(s.count).toBe(8)
    expect(s.dead).toBe(true)
  })

  it('sadnessStage rises with count and caps at 4', () => {
    expect(sadnessStage(0)).toBe(0)
    expect(sadnessStage(1)).toBe(1)
    expect(sadnessStage(4)).toBe(4)
    expect(sadnessStage(7)).toBe(4)
  })

  it('noScale shrinks but never below 0.4; yesScale grows but caps at 1.8', () => {
    expect(noScale(0)).toBe(1)
    expect(noScale(8)).toBeGreaterThanOrEqual(0.4)
    expect(noScale(100)).toBe(0.4)
    expect(yesScale(0)).toBe(1)
    expect(yesScale(100)).toBe(1.8)
    expect(yesScale(4)).toBeGreaterThan(1)
  })
})
