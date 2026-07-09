import { useEffect, useState } from 'react'
import { initialNoState, tapNo, noScale, yesScale, sadnessStage } from '../lib/noMachine'
import { Character } from './Character'
import { WarningModal } from './WarningModal'

export function NoEscalation({ onDead, onYes }) {
  const [state, setState] = useState(initialNoState)
  const [lastWarning, setLastWarning] = useState(null)

  useEffect(() => {
    if (state.dead) onDead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.dead])

  function handleNo() {
    setState(tapNo)
  }

  useEffect(() => {
    if (state.modal) setLastWarning(state.modal)
  }, [state.modal])

  function dismissModal() {
    setState((s) => ({ ...s, modal: null }))
  }

  const emotion = state.dead ? 'dead' : `sad-${Math.max(1, sadnessStage(state.count))}`
  const p = state.dead ? 0.1 : 0.5

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <Character emotion={emotion} p={p} />

      {state.dead ? (
        <div className="relative z-10 mt-24 flex flex-col items-center">
          <span
            data-testid="ember"
            className="mb-6"
            style={{ color: '#F4C36A', fontSize: 22, textShadow: '0 0 10px #F4C36A' }}
          >
            ✿
          </span>
          <button
            onClick={onYes}
            className="px-4 py-2 rounded-full font-body text-sm opacity-70"
            style={{ background: 'var(--coral)', color: 'white', minHeight: '44px' }}
          >
            …¿Sí?
          </button>
        </div>
      ) : (
        <div className="relative z-10 mt-24 flex flex-col items-center gap-4">
          {lastWarning && (
            <p className="font-body text-sm" style={{ color: 'var(--cream)' }}>
              {lastWarning}
            </p>
          )}
          <div className="flex gap-6 items-center">
            <button
              onClick={onYes}
              className="rounded-full text-white font-body"
              style={{
                background: 'var(--coral)',
                transform: `scale(${yesScale(state.count)})`,
                transition: 'transform 250ms ease-out',
                padding: '12px 32px',
                minHeight: '44px',
              }}
            >
              Sí
            </button>
            <button
              onClick={handleNo}
              className="rounded-full text-white font-body"
              style={{
                background: 'var(--muted-rose)',
                transform: `scale(${noScale(state.count)})`,
                transition: 'transform 250ms ease-out',
                padding: '12px 32px',
                minHeight: '44px',
              }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {state.modal && <WarningModal message={state.modal} onClose={dismissModal} />}
    </div>
  )
}
