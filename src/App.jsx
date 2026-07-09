import { useState } from 'react'
import { STORY } from './content/story'
import { Scene } from './components/Scene'
import { Particles } from './components/Particles'
import { Character } from './components/Character'
import { StoryText } from './components/StoryText'
import { ProgressDots } from './components/ProgressDots'
import { QuestionScreen } from './components/QuestionScreen'
import { NoEscalation } from './components/NoEscalation'
import { YesFlow } from './components/YesFlow'
import { notify } from './lib/notify'

const READING = 'READING'
const QUESTION = 'QUESTION'
const YES_FLOW = 'YES_FLOW'
const NO_ESCALATION = 'NO_ESCALATION'

export default function App() {
  const [screen, setScreen] = useState(READING)
  const [beat, setBeat] = useState(0)
  const [noDead, setNoDead] = useState(false)

  const total = STORY.length
  const readingP = total > 1 ? beat / (total - 1) : 1
  const p =
    screen === READING ? readingP
    : screen === NO_ESCALATION && noDead ? 0.1
    : 1

  function advance() {
    if (beat < total - 1) setBeat((b) => b + 1)
    else setScreen(QUESTION)
  }

  return (
    <div className="relative mx-auto overflow-hidden" style={{ maxWidth: 480, height: '100dvh', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <Scene p={p} />
      <Particles p={p} />

      {screen === READING && (
        <>
          <Character emotion="walk" p={p} />
          <ProgressDots total={total} current={beat} />
          <StoryText text={STORY[beat]} p={p} onAdvance={advance} />
        </>
      )}

      {screen === QUESTION && (
        <QuestionScreen onYes={() => setScreen(YES_FLOW)} onNo={() => setScreen(NO_ESCALATION)} />
      )}

      {screen === NO_ESCALATION && (
        <NoEscalation
          onDead={() => { notify({ kind: 'no' }); setNoDead(true) }}
          onYes={() => setScreen(YES_FLOW)}
        />
      )}

      {screen === YES_FLOW && <YesFlow />}
    </div>
  )
}
