import type { ConfirmationStatus } from '../data/players'

type ConfirmationChoice = Exclude<
  ConfirmationStatus,
  'pending'
>

type ConfirmationCardProps = {
  currentConfirmation: ConfirmationStatus | undefined
  isOpen: boolean
  statusText: string
  deadlineText: string
  onConfirm: (confirmation: ConfirmationChoice) => void
}

export function ConfirmationCard({
  currentConfirmation,
  isOpen,
  statusText,
  deadlineText,
  onConfirm,
}: ConfirmationCardProps) {
  return (
    <section className="match-card">
      <div className="match-card__header">
        <div>
          <span className="status">{statusText}</span>
          <h2>Você vai jogar?</h2>
        </div>

        <span className="match-time">20h</span>
      </div>

      <p className="deadline">{deadlineText}</p>

      <div className="confirmation-actions">
        <button
          className={`confirmation-button confirmation-button--inside ${
            currentConfirmation === 'inside'
              ? 'confirmation-button--selected'
              : ''
          }`}
          type="button"
          disabled={!isOpen}
          aria-pressed={currentConfirmation === 'inside'}
          onClick={() => onConfirm('inside')}
        >
          Dentro
        </button>

        <button
          className={`confirmation-button confirmation-button--outside ${
            currentConfirmation === 'outside'
              ? 'confirmation-button--selected'
              : ''
          }`}
          type="button"
          disabled={!isOpen}
          aria-pressed={currentConfirmation === 'outside'}
          onClick={() => onConfirm('outside')}
        >
          Fora
        </button>
      </div>

      <p
        className="confirmation-feedback"
        aria-live="polite"
      >
        {currentConfirmation === 'pending' &&
          'Você ainda não respondeu.'}

        {currentConfirmation === 'inside' &&
          'Sua resposta atual: Dentro.'}

        {currentConfirmation === 'outside' &&
          'Sua resposta atual: Fora.'}
      </p>
    </section>
  )
}