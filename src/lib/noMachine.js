export function initialNoState() {
  return { count: 0, dead: false, modal: null }
}

export function tapNo(state) {
  if (state.dead) return state
  const count = state.count + 1
  const dead = count >= 8
  let modal = null
  if (count === 5) modal = '2 veces más y será definitivo'
  else if (count === 7) modal = 'Última oportunidad'
  return { count, dead, modal }
}

export function sadnessStage(count) {
  return Math.min(4, count)
}

export function noScale(count) {
  return Math.max(0.4, 1 - count * 0.08)
}

export function yesScale(count) {
  return Math.min(1.8, 1 + count * 0.1)
}
