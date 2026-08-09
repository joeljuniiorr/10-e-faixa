import { TeamLineupCard } from '../components/TeamLineupCard'
import type { Player } from '../data/players'
import type { RoundPlayerAssignment } from '../data/round'

type GamesPageProps = {
  formattedRoundDate: string
  isResultsOpen: boolean
  players: Player[]
  assignments: RoundPlayerAssignment[]
}

export function GamesPage({
  formattedRoundDate,
  isResultsOpen,
  players,
  assignments,
}: GamesPageProps) {
  return (
    <section className="games-page">
      <div className="page-heading">
        <p className="eyebrow">Futebol da Raça</p>
        <h1>Jogos</h1>
        <p>
          Acompanhe os placares e o histórico das partidas
          da pelada.
        </p>
      </div>

      <section className="games-round-card">
        <div>
          <p className="eyebrow">Rodada atual</p>
          <h2>{formattedRoundDate}</h2>
          <p>20h às 21h</p>
        </div>

        <span
          className={`results-status ${
            isResultsOpen
              ? 'results-status--open'
              : 'results-status--waiting'
          }`}
        >
          {isResultsOpen
            ? 'Resultados liberados'
            : 'Aguardando o jogo'}
        </span>
      </section>

      <section className="lineup-section">
            <div className="section-heading">
                <div>
                <p className="eyebrow">Confronto</p>
                <h2>Formação da rodada</h2>
                </div>

                <span>8 × 8</span>
            </div>

            <div className="lineup-teams">
                <TeamLineupCard
                team="blue"
                players={players}
                assignments={assignments}
                />

                <div className="versus-divider">
                <span>×</span>
                </div>

                <TeamLineupCard
                team="black"
                players={players}
                assignments={assignments}
                />
            </div>
        </section>

      <section className="games-empty-card">
        <h2>
          {isResultsOpen
            ? 'Nenhum jogo registrado'
            : 'Os placares ainda não estão disponíveis'}
        </h2>

        <p>
          {isResultsOpen
            ? 'O administrador já pode começar a registrar os jogos desta rodada.'
            : 'O registro dos resultados será liberado automaticamente na segunda-feira, às 21h.'}
        </p>

        {isResultsOpen && (
          <button
            className="primary-action-button"
            type="button"
          >
            Registrar primeiro jogo
          </button>
        )}
      </section>
    </section>
  )
}