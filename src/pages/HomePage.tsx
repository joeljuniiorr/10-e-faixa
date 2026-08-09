import { ConfirmationCard } from '../components/ConfirmationCard'
import type { ConfirmationStatus } from '../data/players'

type ConfirmationChoice = Exclude<
  ConfirmationStatus,
  'pending'
>

type HomePageProps = {
  formattedRoundDate: string
  currentConfirmation: ConfirmationStatus | undefined
  isConfirmationOpen: boolean
  confirmationStatusText: string
  confirmationDeadlineText: string
  insideCount: number
  outsideCount: number
  pendingCount: number
  playersCount: number
  onConfirm: (confirmation: ConfirmationChoice) => void
}

export function HomePage({
  formattedRoundDate,
  currentConfirmation,
  isConfirmationOpen,
  confirmationStatusText,
  confirmationDeadlineText,
  insideCount,
  outsideCount,
  pendingCount,
  playersCount,
  onConfirm,
}: HomePageProps) {
  return (
    <>
      <section className="welcome">
        <p className="eyebrow">Próxima rodada</p>
        <h1>Futebol da Raça</h1>
        <p>{formattedRoundDate} · 20h às 21h</p>
      </section>

      <ConfirmationCard
        currentConfirmation={currentConfirmation}
        isOpen={isConfirmationOpen}
        statusText={confirmationStatusText}
        deadlineText={confirmationDeadlineText}
        onConfirm={onConfirm}
      />

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mensalistas</p>
            <h2>Confirmações</h2>
          </div>

          <span>{playersCount} jogadores</span>
        </div>

        <div className="summary-list">
          <div className="summary-item">
            <strong>{insideCount}</strong>
            <span>Dentro</span>
          </div>

          <div className="summary-item">
            <strong>{outsideCount}</strong>
            <span>Fora</span>
          </div>

          <div className="summary-item">
            <strong>{pendingCount}</strong>
            <span>Pendentes</span>
          </div>
        </div>
      </section>
    </>
  )
}