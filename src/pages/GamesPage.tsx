import { useState } from 'react'
import { Link } from 'react-router'
import { RoundScoreForm } from '../components/RoundScoreForm'
import { TeamLineupCard } from '../components/TeamLineupCard'
import type { Player } from '../data/players'
import type {
  RoundPlayerAssignment,
  RoundResult,
} from '../data/round'

type GamesPageProps = {
  formattedRoundDate: string
  isResultsOpen: boolean
  isEvaluationOpen: boolean
  evaluationStatusText: string
  isAdmin: boolean
  players: Player[]
  assignments: RoundPlayerAssignment[]
  roundResult: RoundResult | null

  onSwapPlayers: (
    firstPlayerId: string,
    secondPlayerId: string,
  ) => void

  onSaveRoundResult: (
    blueScore: number,
    blackScore: number,
  ) => void
}

export function GamesPage({
  formattedRoundDate,
  isResultsOpen,
  isEvaluationOpen,
  evaluationStatusText,
  isAdmin,
  players,
  assignments,
  roundResult,
  onSwapPlayers,
  onSaveRoundResult,
}: GamesPageProps) {
  const [isEditingLineup, setIsEditingLineup] =
    useState(false)

  const [selectedPlayerIds, setSelectedPlayerIds] =
    useState<string[]>([])

  const [isScoreFormOpen, setIsScoreFormOpen] =
    useState(false)

  function handleSelectPlayer(playerId: string) {
    setSelectedPlayerIds((currentIds) => {
      if (currentIds.includes(playerId)) {
        return currentIds.filter(
          (currentId) => currentId !== playerId,
        )
      }

      if (currentIds.length === 2) {
        return currentIds
      }

      return [...currentIds, playerId]
    })
  }

  function handleSwapSelectedPlayers() {
    if (selectedPlayerIds.length !== 2) {
      return
    }

    onSwapPlayers(
      selectedPlayerIds[0],
      selectedPlayerIds[1],
    )

    setSelectedPlayerIds([])
  }

  function getRoundResultText() {
    if (!roundResult) {
      return null
    }

    if (
      roundResult.blueScore >
      roundResult.blackScore
    ) {
      return 'Time Azul venceu'
    }

    if (
      roundResult.blackScore >
      roundResult.blueScore
    ) {
      return 'Time Preto venceu'
    }

    return 'Empate'
  }

  return (
    <section className="games-page">
      <div className="page-heading">
        <p className="eyebrow">
          Futebol da Raça
        </p>

        <h1>Jogos</h1>

        <p>
          Acompanhe a formação e o resultado
          da rodada semanal.
        </p>
      </div>

      <section className="games-round-card">
        <div>
          <p className="eyebrow">
            Rodada atual
          </p>

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
            <p className="eyebrow">
              Confronto
            </p>

            <h2>Formação da rodada</h2>
          </div>

          {isAdmin && (
            <button
              className="lineup-edit-button"
              type="button"
              onClick={() => {
                setIsEditingLineup(
                  (current) => !current,
                )

                setSelectedPlayerIds([])
              }}
            >
              {isEditingLineup
                ? 'Concluir'
                : 'Editar'}
            </button>
          )}
        </div>

        {isEditingLineup && (
          <div className="lineup-edit-panel">
            <p>
              Selecione dois jogadores para
              trocar suas posições na formação.
            </p>

            <strong>
              {selectedPlayerIds.length} de 2
              selecionados
            </strong>

            <button
              className="primary-action-button"
              type="button"
              disabled={
                selectedPlayerIds.length !== 2
              }
              onClick={
                handleSwapSelectedPlayers
              }
            >
              Trocar jogadores
            </button>
          </div>
        )}

        <div className="lineup-teams">
          <TeamLineupCard
            team="blue"
            players={players}
            assignments={assignments}
            isEditing={isEditingLineup}
            selectedPlayerId={
              selectedPlayerIds.find(
                (playerId) =>
                  assignments.some(
                    (assignment) =>
                      assignment.playerId ===
                        playerId &&
                      assignment.team ===
                        'blue',
                  ),
              ) ?? null
            }
            onSelectPlayer={
              handleSelectPlayer
            }
          />

          <div className="versus-divider">
            <span>×</span>
          </div>

          <TeamLineupCard
            team="black"
            players={players}
            assignments={assignments}
            isEditing={isEditingLineup}
            selectedPlayerId={
              selectedPlayerIds.find(
                (playerId) =>
                  assignments.some(
                    (assignment) =>
                      assignment.playerId ===
                        playerId &&
                      assignment.team ===
                        'black',
                  ),
              ) ?? null
            }
            onSelectPlayer={
              handleSelectPlayer
            }
          />
        </div>
      </section>

      <section className="round-result-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Resultado
            </p>

            <h2>Placar da rodada</h2>
          </div>

          {roundResult && (
            <span className="round-result-status">
              Final
            </span>
          )}
        </div>

        {!isResultsOpen && (
          <div className="round-result-waiting">
            <p>
              O placar poderá ser registrado
              na segunda-feira, a partir das
              21h.
            </p>
          </div>
        )}

        {isResultsOpen &&
          !roundResult &&
          !isScoreFormOpen && (
            <div className="round-result-empty">
              <p>
                O administrador ainda não
                registrou o resultado desta
                rodada.
              </p>

              {isAdmin && (
                <button
                  className="primary-action-button"
                  type="button"
                  onClick={() =>
                    setIsScoreFormOpen(true)
                  }
                >
                  Registrar placar
                </button>
              )}
            </div>
          )}

        {isResultsOpen &&
          isScoreFormOpen && (
            <RoundScoreForm
              currentResult={roundResult}
              onSave={(
                blueScore,
                blackScore,
              ) => {
                onSaveRoundResult(
                  blueScore,
                  blackScore,
                )

                setIsScoreFormOpen(false)
              }}
              onCancel={() =>
                setIsScoreFormOpen(false)
              }
            />
          )}

        {isResultsOpen &&
          roundResult &&
          !isScoreFormOpen && (
            <div className="round-score">
              <div className="round-score__team">
                <span>Time Azul</span>

                <strong>
                  {roundResult.blueScore}
                </strong>
              </div>

              <span className="round-score__separator">
                ×
              </span>

              <div className="round-score__team">
                <span>Time Preto</span>

                <strong>
                  {roundResult.blackScore}
                </strong>
              </div>

              <p className="round-score__result">
                {getRoundResultText()}
              </p>

              {isAdmin && (
                <button
                  className="secondary-action-button round-score__edit"
                  type="button"
                  onClick={() =>
                    setIsScoreFormOpen(true)
                  }
                >
                  Editar placar
                </button>
              )}
            </div>
          )}
      </section>

      <section className="evaluation-cta-card">
        <p className="eyebrow">Avaliações</p>
        <h2>
          {isEvaluationOpen
            ? 'Avaliações abertas'
            : 'Avaliações indisponíveis'}
        </h2>
        <p>{evaluationStatusText}</p>

        {isEvaluationOpen && (
          <Link
            className="evaluation-cta-link"
            to="/avaliacoes"
          >
            Avaliar jogadores
          </Link>
        )}
      </section>
    </section>
  )
}
