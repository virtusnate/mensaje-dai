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
        className="absolute left-0 right-0 bottom-0 px-7 pt-5 pb-9 rounded-t-[28px]"
        style={{
          minHeight: '34%',
          background: 'linear-gradient(180deg,#FDF7E6,#F3E4C6)',
          borderTop: '2px solid rgba(212,165,116,0.7)',
          boxShadow: '0 -10px 34px rgba(44,26,14,0.28)',
          color: 'var(--sepia)',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
          <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
          <span style={{ color: '#8AA05A', fontSize: 12 }}>✿</span>
          <span style={{ width: 26, height: 1, background: '#C86B5A' }} />
        </div>
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
