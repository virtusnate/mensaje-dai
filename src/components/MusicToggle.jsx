import { useEffect, useRef, useState } from 'react'
import { createChiptune } from '../lib/chiptune'

// Small speaker toggle (top-right). Chiptune starts on the first tap anywhere (browser autoplay
// policy), and `mood` switches the loop (story → hopeful on Sí).
export function MusicToggle({ mood }) {
  const engine = useRef(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    engine.current = createChiptune()
    const startOnGesture = () => engine.current && engine.current.start()
    window.addEventListener('pointerdown', startOnGesture, { once: true })
    return () => window.removeEventListener('pointerdown', startOnGesture)
  }, [])

  useEffect(() => {
    if (engine.current) engine.current.setMood(mood)
  }, [mood])

  function toggle() {
    const e = engine.current
    if (!e) return
    e.start()
    setMuted(e.toggle())
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Activar música' : 'Silenciar música'}
      className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background: 'rgba(44,26,14,0.35)', color: '#FBF3DE', backdropFilter: 'blur(2px)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        {muted ? (
          <path d="M22 9l-6 6M16 9l6 6" />
        ) : (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 6a9 9 0 0 1 0 12" />
          </>
        )}
      </svg>
    </button>
  )
}
