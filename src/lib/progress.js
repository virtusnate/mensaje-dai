export function lerp(a, b, t) {
  return a + (b - a) * t
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function toHex(n) {
  return Math.round(n).toString(16).padStart(2, '0')
}

export function mixHex(start, end, t) {
  const a = hexToRgb(start)
  const b = hexToRgb(end)
  return '#' + [0, 1, 2].map((i) => toHex(lerp(a[i], b[i], t))).join('')
}

const DUSK = { top: '#3E3355', mid: '#5A4A6A', low: '#7D6A72' }
const GOLD = { top: '#F7D489', mid: '#EFAC6A', low: '#E08A5E' }

export function skyGradient(p) {
  const top = mixHex(DUSK.top, GOLD.top, p)
  const mid = mixHex(DUSK.mid, GOLD.mid, p)
  const low = mixHex(DUSK.low, GOLD.low, p)
  return `linear-gradient(${top}, ${mid} 55%, ${low})`
}

export function charXPercent(p) {
  return lerp(10, 85, p)
}

export function textColor(p) {
  return p > 0.6 ? 'var(--sepia)' : 'var(--cream)'
}
