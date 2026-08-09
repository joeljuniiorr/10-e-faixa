import { useState } from 'react'
import type { RoundResult } from '../data/round'

type RoundScoreFormProps = {
  currentResult: RoundResult | null
  onSave: (
    blueScore: number,
    blackScore: number,
  ) => void
  onCancel: () => void
}

export function RoundScoreForm({
  currentResult,
  onSave,
  onCancel,
}: RoundScoreFormProps) {
  const [blueScore, setBlueScore] = useState(
    currentResult?.blueScore.toString() ?? '',
  )

  const [blackScore, setBlackScore] = useState(
    currentResult?.blackScore.toString() ?? '',
  )

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (blueScore === '' || blackScore === '') {
      return
    }

    const blueScoreNumber = Number(blueScore)
    const blackScoreNumber = Number(blackScore)

    if (
      blueScoreNumber < 0 ||
      blackScoreNumber < 0 ||
      !Number.isInteger(blueScoreNumber) ||
      !Number.isInteger(blackScoreNumber)
    ) {
      return
    }

    onSave(
      blueScoreNumber,
      blackScoreNumber,
    )
  }

  return (
    <form
      className="round-score-form"
      onSubmit={handleSubmit}
    >
      <div className="round-score-form__score">
        <label>
          <span>Time Azul</span>

          <input
            type="number"
            min="0"
            step="1"
            value={blueScore}
            onChange={(event) =>
              setBlueScore(event.target.value)
            }
            required
          />
        </label>

        <span className="round-score-form__separator">
          ×
        </span>

        <label>
          <span>Time Preto</span>

          <input
            type="number"
            min="0"
            step="1"
            value={blackScore}
            onChange={(event) =>
              setBlackScore(event.target.value)
            }
            required
          />
        </label>
      </div>

      <div className="round-score-form__actions">
        <button
          className="secondary-action-button"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>

        <button
          className="primary-action-button"
          type="submit"
        >
          Salvar placar
        </button>
      </div>
    </form>
  )
}