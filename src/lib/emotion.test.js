import { describe, it, expect } from 'vitest'
import { bloomIntensity, petalMode, driftX } from './emotion'

describe('bloomIntensity', () => {
  it('is ~0 early in reading and grows faint by the end', () => {
    expect(bloomIntensity('READING', 0)).toBeCloseTo(0)
    expect(bloomIntensity('READING', 1)).toBeCloseTo(0.35)
  })
  it('swells at the question and flares full on Sí', () => {
    expect(bloomIntensity('QUESTION', 1)).toBe(0.7)
    expect(bloomIntensity('YES_FLOW', 1)).toBe(1)
  })
  it('is 0 (dusk) during the No escalation', () => {
    expect(bloomIntensity('NO_ESCALATION', 1)).toBe(0)
  })
})

describe('petalMode', () => {
  it('maps screen to a petal mode', () => {
    expect(petalMode('READING')).toBe('reading')
    expect(petalMode('QUESTION')).toBe('question')
    expect(petalMode('YES_FLOW')).toBe('burst')
    expect(petalMode('NO_ESCALATION')).toBe('reading')
  })
})

describe('driftX', () => {
  it('drifts the world left as reading progresses', () => {
    expect(driftX(0)).toBe(0)
    expect(driftX(1)).toBe(-40)
    expect(driftX(0.5)).toBe(-20)
  })
})
