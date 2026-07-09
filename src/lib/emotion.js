// Single source of truth: translate the current screen + reading progress (p, 0..1)
// into the presentation values every visual layer reads.
export function bloomIntensity(screen, p) {
  if (screen === 'YES_FLOW') return 1
  if (screen === 'QUESTION') return 0.7
  if (screen === 'NO_ESCALATION') return 0
  return Math.min(0.35, p * 0.35)
}

export function petalMode(screen) {
  if (screen === 'YES_FLOW') return 'burst'
  if (screen === 'QUESTION') return 'question'
  return 'reading'
}

export function driftX(p) {
  return p === 0 ? 0 : -40 * p
}
