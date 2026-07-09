import { useState } from 'react'
import { QuestionCard } from './QuestionCard'
import { FloralFinale } from './FloralFinale'
import { Character } from './Character'
import { notify } from '../lib/notify'

const WHEN = ['Este Sábado', 'El próximo Lunes', 'El próximo Viernes']
const TIME = ['11 pm', '1 pm', '3 pm']

export function YesFlow() {
  const [step, setStep] = useState('cuando')
  const [cuando, setCuando] = useState('')

  function answerCuando(v) {
    setCuando(v)
    setStep('hora')
  }

  function answerHora(v) {
    notify({ kind: 'yes', cuando, hora: v })
    setStep('finale')
  }

  return (
    <div className="absolute inset-0">
      <Character emotion="happy" p={1} />
      {step === 'cuando' && (
        <QuestionCard title="¿Cuándo puedes?" options={WHEN} onAnswer={answerCuando} />
      )}
      {step === 'hora' && (
        <QuestionCard title="¿A qué hora te gustaría?" options={TIME} onAnswer={answerHora} />
      )}
      {step === 'finale' && <FloralFinale />}
    </div>
  )
}
