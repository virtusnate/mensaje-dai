import { textColor } from '../lib/progress'

export function StoryText({ text, p, onAdvance }) {
  function onKey(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault()
      onAdvance()
    }
  }

  return (
    <div
      data-testid="advance-zone"
      role="button"
      tabIndex={0}
      onClick={onAdvance}
      onKeyDown={onKey}
      aria-label="Continuar la historia"
      className="absolute inset-0 flex items-center justify-center px-8 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'var(--scrim)', pointerEvents: 'none' }}
      />
      <div className="relative max-w-md text-center">
        <p
          data-testid="beat-live"
          aria-live="polite"
          className="font-body text-xl md:text-2xl leading-relaxed"
          style={{ color: textColor(p), textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        >
          {text}
        </p>
        <p className="mt-6 text-sm tracking-widest uppercase opacity-60" style={{ color: textColor(p) }}>
          tocar para continuar ▸
        </p>
      </div>
    </div>
  )
}
