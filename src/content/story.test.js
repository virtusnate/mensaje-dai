import { describe, it, expect } from 'vitest'
import { STORY } from './story'

describe('STORY', () => {
  it('is a non-empty array of strings', () => {
    expect(Array.isArray(STORY)).toBe(true)
    expect(STORY.length).toBeGreaterThan(0)
    STORY.forEach((beat) => expect(typeof beat).toBe('string'))
  })

  it('every beat has meaningful content (no empty/whitespace beats)', () => {
    STORY.forEach((beat) => expect(beat.trim().length).toBeGreaterThan(10))
  })

  it('starts with the opening line and ends before the question', () => {
    expect(STORY[0]).toMatch(/^No me imaginaba/)
    expect(STORY[STORY.length - 1]).toMatch(/mejor última cita\.$/)
  })
})
