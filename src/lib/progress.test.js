import { describe, it, expect } from 'vitest'
import { lerp, mixHex, charXPercent, textColor } from './progress'

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 1)).toBe(10)
    expect(lerp(0, 10, 0.5)).toBe(5)
  })
})

describe('mixHex', () => {
  it('returns start color at t=0 and end at t=1', () => {
    expect(mixHex('#000000', '#ffffff', 0).toLowerCase()).toBe('#000000')
    expect(mixHex('#000000', '#ffffff', 1).toLowerCase()).toBe('#ffffff')
  })
  it('returns a valid 7-char hex mid-way', () => {
    const mid = mixHex('#000000', '#ffffff', 0.5)
    expect(mid).toMatch(/^#[0-9a-f]{6}$/i)
    expect(mid.toLowerCase()).toBe('#808080')
  })
})

describe('charXPercent', () => {
  it('walks left (10%) to right (85%) as p goes 0→1', () => {
    expect(charXPercent(0)).toBeCloseTo(10)
    expect(charXPercent(1)).toBeCloseTo(85)
    expect(charXPercent(0.5)).toBeCloseTo(47.5)
  })
})

describe('textColor', () => {
  it('is cream while dark, sepia once bright (p > 0.6)', () => {
    expect(textColor(0)).toBe('var(--cream)')
    expect(textColor(0.5)).toBe('var(--cream)')
    expect(textColor(0.7)).toBe('var(--sepia)')
    expect(textColor(1)).toBe('var(--sepia)')
  })
})

import { skyGradient } from './progress'

describe('skyGradient', () => {
  it('produces a linear-gradient string with three hex stops', () => {
    const g = skyGradient(0.5)
    expect(g).toMatch(/^linear-gradient\(#[0-9a-f]{6}, #[0-9a-f]{6} 55%, #[0-9a-f]{6}\)$/i)
  })
})
