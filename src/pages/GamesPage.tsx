import { useState } from 'react'
import { TeamLineupCard } from '../components/TeamLineupCard'
import type { Player } from '../data/players'
import type { RoundPlayerAssignment } from '../data/round'

type GamesPageProps = {
  formattedRoundDate: string
  isResultsOpen: boolean
  isAdmin: boolean
  players: Player[]
  assignments: RoundPlayerAssignment[]
  onSwapPlayers: (
    firstPlayerId: number,
    secondPlayerId: number,
  ) => void
}

export function GamesPage({
  formattedRoundDate,
  isResultsOpen,
  isAdmin,
  players,
  assignments,
  onSwapPlayers,
}: GamesPageProps) {

    const [isEditingLineup, setIsEditingLineup] =
  useState(false)

    const [selectedPlayerIds, setSelectedPlayerIds] =
    useState<number[]>([])

    function handleSelectPlayer(playerId: number) {
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

                {isAdmin && (
                    <button
                    className="lineup-edit-button"
                    type="button"
                    onClick={() => {
                        setIsEditingLineup((current) => !current)
                        setSelectedPlayerIds([])
                    }}
                    >
                    {isEditingLineup ? 'Concluir' : 'Editar'}
                    </button>
                )}
                </div>

                {isEditingLineup && (
                    <div className="lineup-edit-panel">
                        <p>
                        Selecione dois jogadores para trocar suas
                        posições na formação.
                        </p>

                        <strong>
                        {selectedPlayerIds.length} de 2 selecionados
                        </strong>

                        <button
                        className="primary-action-button"
                        type="button"
                        disabled={selectedPlayerIds.length !== 2}
                        onClick={handleSwapSelectedPlayers}
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
                        selectedPlayerIds.find((playerId) =>
                        assignments.some(
                            (assignment) =>
                            assignment.playerId === playerId &&
                            assignment.team === 'blue',
                        ),
                        ) ?? null
                    }
                    onSelectPlayer={handleSelectPlayer}
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
                        selectedPlayerIds.find((playerId) =>
                        assignments.some(
                            (assignment) =>
                            assignment.playerId === playerId &&
                            assignment.team === 'black',
                        ),
                        ) ?? null
                    }
                    onSelectPlayer={handleSelectPlayer}
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