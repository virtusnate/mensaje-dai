// Layout A: the scene + character sit above; the letter reads in a dedicated card pinned to
// the bottom. The whole screen is the tap/keyboard advance zone so any tap moves the story on.
export function StoryText({ text, onAdvance }) {
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
      className="absolute inset-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <div
        className="absolute left-0 right-0 bottom-0 px-6 pt-6 pb-8 rounded-t-3xl"
        style={{
          minHeight: '42%',
          background: '#FDF6E3',
          boxShadow: '0 -8px 30px rgba(44,26,14,0.25)',
          color: 'var(--sepia)',
        }}
      >
        <p
          data-testid="beat-live"
          aria-live="polite"
          className="font-body text-2xl md:text-3xl leading-relaxed"
        >
          {text}
        </p>
        <p className="mt-5 text-xs tracking-[0.25em] uppercase opacity-50 text-right">
          tocar para continuar ▸
        </p>
      </div>
    </div>
  )
}
