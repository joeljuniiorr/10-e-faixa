import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Player } from '../data/players'
import type {
  RoundPlayerAssignment,
  RoundPosition,
  TeamColor,
} from '../data/round'
import { supabase } from '../lib/supabase'

type RoundPlayerStatsRow = {
  player_id: string
  goals: number
  assists: number
  goalkeeper_saves: number
}

type EditablePlayerStats = {
  goals: string
  assists: string
  goalkeeperSaves: string
}

type StatsFeedback = {
  kind: 'success' | 'error'
  message: string
}

type RoundStatsPageProps = {
  roundId: string | null
  currentPlayerId: string | null
  players: Player[]
  assignments: RoundPlayerAssignment[]
  isAdmin: boolean
  isResultsOpen: boolean
}

const positionLabels: Record<RoundPosition, string> = {
  line: 'Linha',
  reserve: 'Reserva',
  goalkeeper: 'Goleiro',
}

function createStatsState(
  assignments: RoundPlayerAssignment[],
  persistedStats: RoundPlayerStatsRow[] = [],
) {
  const persistedStatsByPlayerId = new Map(
    persistedStats.map((stats) => [stats.player_id, stats]),
  )

  return Object.fromEntries(
    assignments.map((assignment) => {
      const stats = persistedStatsByPlayerId.get(
        assignment.playerId,
      )

      return [
        assignment.playerId,
        {
          goals: String(stats?.goals ?? 0),
          assists: String(stats?.assists ?? 0),
          goalkeeperSaves: String(
            stats?.goalkeeper_saves ?? 0,
          ),
        },
      ]
    }),
  ) as Record<string, EditablePlayerStats>
}

function parseStatValue(value: string) {
  if (value.trim() === '') {
    return null
  }

  const parsedValue = Number(value)

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0
  ) {
    return null
  }

  return parsedValue
}

export function RoundStatsPage({
  roundId,
  currentPlayerId,
  players,
  assignments,
  isAdmin,
  isResultsOpen,
}: RoundStatsPageProps) {
  const [statsByPlayerId, setStatsByPlayerId] =
    useState<Record<string, EditablePlayerStats>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] =
    useState<string | null>(null)
  const [feedback, setFeedback] =
    useState<StatsFeedback | null>(null)

  const participants = assignments.flatMap(
    (assignment) => {
      const player = players.find(
        (currentPlayer) =>
          currentPlayer.id === assignment.playerId,
      )

      if (!player) {
        return []
      }

      return [{ player, assignment }]
    },
  )

  const canEdit = Boolean(
    roundId &&
      currentPlayerId &&
      isAdmin &&
      isResultsOpen,
  )

  useEffect(() => {
    let ignoreResult = false

    async function loadRoundStats() {
      setStatsByPlayerId(createStatsState(assignments))
      setLoadError(null)
      setFeedback(null)

      if (!roundId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await supabase
        .from('round_player_stats')
        .select(
          'player_id, goals, assists, goalkeeper_saves',
        )
        .eq('round_id', roundId)
        .overrideTypes<
          RoundPlayerStatsRow[],
          { merge: false }
        >()

      if (ignoreResult) {
        return
      }

      setIsLoading(false)

      if (error) {
        console.error(
          'Erro ao carregar estatísticas da rodada:',
          error,
        )
        setLoadError(
          'Não foi possível carregar as estatísticas da rodada.',
        )
        return
      }

      setStatsByPlayerId(
        createStatsState(assignments, data),
      )
    }

    void loadRoundStats()

    return () => {
      ignoreResult = true
    }
  }, [assignments, roundId])

  function handleStatChange(
    playerId: string,
    field: keyof EditablePlayerStats,
    value: string,
  ) {
    setStatsByPlayerId((currentStats) => ({
      ...currentStats,
      [playerId]: {
        ...(currentStats[playerId] ?? {
          goals: '0',
          assists: '0',
          goalkeeperSaves: '0',
        }),
        [field]: value,
      },
    }))
    setFeedback(null)
  }

  async function handleSaveStats() {
    if (
      !canEdit ||
      !roundId ||
      !currentPlayerId ||
      isSaving
    ) {
      return
    }

    const updatedAt = new Date().toISOString()
    const statsToSave = []

    for (const assignment of assignments) {
      const playerStats = statsByPlayerId[
        assignment.playerId
      ] ?? {
        goals: '0',
        assists: '0',
        goalkeeperSaves: '0',
      }

      const goals = parseStatValue(playerStats.goals)
      const assists = parseStatValue(playerStats.assists)
      const goalkeeperSaves = parseStatValue(
        playerStats.goalkeeperSaves,
      )

      if (
        goals === null ||
        assists === null ||
        goalkeeperSaves === null
      ) {
        setFeedback({
          kind: 'error',
          message:
            'Use apenas números inteiros iguais ou maiores que zero.',
        })
        return
      }

      statsToSave.push({
        round_id: roundId,
        player_id: assignment.playerId,
        goals,
        assists,
        goalkeeper_saves: goalkeeperSaves,
        updated_by: currentPlayerId,
        updated_at: updatedAt,
      })
    }

    if (statsToSave.length === 0) {
      setFeedback({
        kind: 'error',
        message: 'Não há participantes para salvar.',
      })
      return
    }

    setIsSaving(true)
    setFeedback(null)

    const { error } = await supabase
      .from('round_player_stats')
      .upsert(statsToSave, {
        onConflict: 'round_id,player_id',
      })

    setIsSaving(false)

    if (error) {
      console.error(
        'Erro ao salvar estatísticas da rodada:',
        error,
      )
      setFeedback({
        kind: 'error',
        message:
          'Não foi possível salvar as estatísticas. Tente novamente.',
      })
      return
    }

    setFeedback({
      kind: 'success',
      message: 'Estatísticas salvas.',
    })
  }

  function renderTeam(team: TeamColor, title: string) {
    const teamParticipants = participants.filter(
      ({ assignment }) => assignment.team === team,
    )

    return (
      <section
        className={`round-stats-team round-stats-team--${team}`}
      >
        <div className="round-stats-team__heading">
          <h2>{title}</h2>
          <span>
            {teamParticipants.length}{' '}
            {teamParticipants.length === 1
              ? 'jogador'
              : 'jogadores'}
          </span>
        </div>

        <div className="round-stats-player-list">
          {teamParticipants.map(({ player, assignment }) => {
            const playerStats = statsByPlayerId[player.id] ?? {
              goals: '0',
              assists: '0',
              goalkeeperSaves: '0',
            }
            const isGoalkeeper =
              assignment.position === 'goalkeeper'

            return (
              <article
                className="round-stats-player-card"
                key={player.id}
              >
                <div className="round-stats-player__identity">
                  <span className="player-avatar">
                    {player.name.charAt(0)}
                  </span>
                  <div>
                    <strong>{player.name}</strong>
                    <span
                      className={`position-badge position-badge--${assignment.position}`}
                    >
                      {positionLabels[assignment.position]}
                    </span>
                  </div>
                </div>

                {canEdit ? (
                  <div
                    className={`round-stats-fields ${
                      isGoalkeeper
                        ? 'round-stats-fields--goalkeeper'
                        : ''
                    }`}
                  >
                    <label>
                      <span>Gols</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={playerStats.goals}
                        disabled={isSaving}
                        aria-label={`Gols de ${player.name}`}
                        onChange={(event) =>
                          handleStatChange(
                            player.id,
                            'goals',
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Assistências</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={playerStats.assists}
                        disabled={isSaving}
                        aria-label={`Assistências de ${player.name}`}
                        onChange={(event) =>
                          handleStatChange(
                            player.id,
                            'assists',
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    {isGoalkeeper && (
                      <label>
                        <span>Defesas</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={
                            playerStats.goalkeeperSaves
                          }
                          disabled={isSaving}
                          aria-label={`Defesas de ${player.name}`}
                          onChange={(event) =>
                            handleStatChange(
                              player.id,
                              'goalkeeperSaves',
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div
                    className={`round-stats-values ${
                      isGoalkeeper
                        ? 'round-stats-values--goalkeeper'
                        : ''
                    }`}
                  >
                    <div>
                      <span>Gols</span>
                      <strong>{playerStats.goals}</strong>
                    </div>
                    <div>
                      <span>Assistências</span>
                      <strong>{playerStats.assists}</strong>
                    </div>
                    {isGoalkeeper && (
                      <div>
                        <span>Defesas</span>
                        <strong>
                          {playerStats.goalkeeperSaves}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <section className="round-stats-page">
      <Link className="back-link" to="/jogos">
        ← Voltar para Jogos
      </Link>

      <div className="page-heading">
        <p className="eyebrow">Rodada atual</p>
        <h1>Estatísticas da partida</h1>
        <p>
          Consulte gols, assistências e defesas dos
          participantes da rodada.
        </p>
      </div>

      {!roundId && (
        <section className="round-stats-empty-state">
          <h2>Nenhuma rodada ativa</h2>
          <p>
            As estatísticas aparecerão quando houver uma
            rodada disponível.
          </p>
        </section>
      )}

      {roundId && (
        <section
          className={`round-stats-status-card ${
            isResultsOpen
              ? 'round-stats-status-card--open'
              : ''
          }`}
        >
          <strong>
            {isResultsOpen
              ? 'Resultados liberados'
              : 'Aguardando o jogo'}
          </strong>
          <p>
            {!isResultsOpen
              ? 'As estatísticas poderão ser registradas após o jogo.'
              : isAdmin
                ? 'Você pode registrar ou atualizar as estatísticas da rodada.'
                : 'As estatísticas são registradas pelos administradores do grupo.'}
          </p>
        </section>
      )}

      {roundId && isLoading && (
        <section className="round-stats-empty-state">
          <p>Carregando estatísticas...</p>
        </section>
      )}

      {roundId && !isLoading && loadError && (
        <p
          className="round-stats-feedback round-stats-feedback--error"
          role="status"
        >
          {loadError}
        </p>
      )}

      {roundId &&
        !isLoading &&
        !loadError &&
        participants.length === 0 && (
          <section className="round-stats-empty-state">
            <h2>Participantes indisponíveis</h2>
            <p>
              A formação desta rodada ainda não possui
              jogadores.
            </p>
          </section>
        )}

      {roundId &&
        !isLoading &&
        !loadError &&
        participants.length > 0 && (
          <>
            <div className="round-stats-teams">
              {renderTeam('blue', 'Time Azul')}
              {renderTeam('black', 'Time Preto')}
            </div>

            {canEdit && (
              <button
                className="primary-action-button round-stats-save-button"
                type="button"
                disabled={isSaving}
                onClick={() => {
                  void handleSaveStats()
                }}
              >
                {isSaving
                  ? 'Salvando...'
                  : 'Salvar estatísticas'}
              </button>
            )}
          </>
        )}

      {feedback && (
        <p
          className={`round-stats-feedback round-stats-feedback--${feedback.kind}`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      )}
    </section>
  )
}
