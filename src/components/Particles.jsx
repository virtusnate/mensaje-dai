import { useEffect, useMemo, useState } from 'react'
import ParticlesLib, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { mixHex, lerp } from '../lib/progress'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Particles({ p }) {
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      particles: {
        number: { value: Math.round(lerp(18, 42, p)) },
        color: { value: mixHex('#9db6d6', '#ffe6a8', p) },
        opacity: { value: lerp(0.25, 0.55, p) },
        size: { value: { min: 1, max: 3 } },
        move: { enable: !reduced, speed: lerp(0.3, 0.8, p), direction: 'top', outModes: 'out' },
      },
      detectRetina: true,
    }),
    [p, reduced]
  )

  if (!ready) return null
  return <ParticlesLib id="tsparticles" options={options} className="absolute inset-0" />
}
