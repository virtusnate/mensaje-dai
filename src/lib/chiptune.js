// Tiny self-contained chiptune engine (Web Audio). Two moods loop as square/triangle-wave
// arpeggios with a soft bass: 'story' (gentle, nostalgic, slower) and 'hopeful' (brighter,
// major, faster) — switched when she says Sí. No audio files, no licensing.
// Safe in non-browser/jsdom: if AudioContext is unavailable, every method no-ops.

const MOODS = {
  // vi–IV–I–V (Am–F–C–G): wistful
  story: {
    bpm: 92,
    wave: 'triangle',
    lead: [440, 523, 659, 523, 440, 523, 698, 523, 392, 523, 659, 784, 392, 494, 587, 784],
    bass: [110, 87, 131, 98],
    gain: 0.5,
  },
  // I–V–vi–IV (C–G–Am–F), up an octave, faster: hopeful
  hopeful: {
    bpm: 120,
    wave: 'square',
    lead: [523, 659, 784, 659, 587, 784, 988, 784, 523, 659, 880, 659, 523, 698, 880, 698],
    bass: [131, 98, 110, 87],
    gain: 0.42,
  },
  // Slow descending minor line with rests: mournful (when she says No)
  sad: {
    bpm: 68,
    wave: 'triangle',
    lead: [659, 0, 587, 0, 523, 0, 494, 0, 440, 0, 392, 0, 440, 0, 0, 0],
    bass: [110, 98, 87, 82],
    gain: 0.4,
  },
}

const VOLUME = 0.16

export function createChiptune() {
  let ctx = null
  let master = null
  let timer = null
  let muted = false
  let mood = 'story'
  let step = 0

  function ensure() {
    if (ctx) return true
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    if (!AC) return false
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : VOLUME
    master.connect(ctx.destination)
    return true
  }

  function note(freq, at, dur, wave, gain) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = wave
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, at)
    g.gain.linearRampToValueAtTime(gain, at + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    o.connect(g)
    g.connect(master)
    o.start(at)
    o.stop(at + dur + 0.02)
  }

  function tick() {
    const m = MOODS[mood]
    const eighth = 60 / m.bpm / 2
    const at = ctx.currentTime + 0.06
    const lead = m.lead[step % m.lead.length]
    if (lead) note(lead, at, eighth * 0.9, m.wave, m.gain)
    if (step % 4 === 0) {
      const b = m.bass[(step / 4) % m.bass.length]
      if (b) note(b, at, eighth * 3.6, 'triangle', 0.32)
    }
    step += 1
    timer = setTimeout(tick, eighth * 1000)
  }

  return {
    start() {
      if (!ensure()) return
      if (ctx.state === 'suspended') ctx.resume()
      if (timer === null) tick()
    },
    setMood(next) {
      if (next !== mood) {
        mood = next
        step = 0
      }
    },
    setMuted(v) {
      muted = v
      if (master) master.gain.value = v ? 0 : VOLUME
    },
    toggle() {
      this.setMuted(!muted)
      return muted
    },
    isMuted() {
      return muted
    },
  }
}
