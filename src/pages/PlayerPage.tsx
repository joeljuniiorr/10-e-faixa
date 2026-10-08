import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Player } from '../data/players'
import type {
  RoundPlayerAssignment,
  RoundPosition,
  RoundResult,
  TeamColor,
} from '../data/round'
import { supabase } from '../lib/supabase'

import {
  getPlayerRoundOutcome,
  type PlayerRoundOutcome,
} from '../utils/playerRoundOutcome'

type PlayerPageProps = {
  groupId: string | null
  players: Player[]
  assignments: RoundPlayerAssignment[]
  roundResult: RoundResult | null
}

type PlayerGroupStatsRow = {
  player_id: string
  matches_played: unknown
  wins: unknown
  draws: unknown
  losses: unknown
  goals: unknown
  assists: unknown
  goalkeeper_saves: unknown
}

type PlayerGroupStats = {
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goals: number
  assists: number
  goalkeeperSaves: number
}

const emptyPlayerGroupStats: PlayerGroupStats = {
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goals: 0,
  assists: 0,
  goalkeeperSaves: 0,
}

function normalizeCount(value: unknown) {
  const normalizedValue =
    typeof value === 'number'
      ? value
      : typeof value === 'bigint' &&
          value <= BigInt(Number.MAX_SAFE_INTEGER)
        ? Number(value)
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN

  if (
    !Number.isSafeInteger(normalizedValue) ||
    normalizedValue < 0
  ) {
    return 0
  }

  return normalizedValue
}

function normalizePlayerGroupStats(
  row: PlayerGroupStatsRow,
): PlayerGroupStats {
  return {
    matchesPlayed: normalizeCount(row.matches_played),
    wins: normalizeCount(row.wins),
    draws: normalizeCount(row.draws),
    losses: normalizeCount(row.losses),
    goals: normalizeCount(row.goals),
    assists: normalizeCount(row.assists),
    goalkeeperSaves: normalizeCount(
      row.goalkeeper_saves,
    ),
  }
}

function getConfirmationLabel(
  confirmation: Player['confirmation'],
) {
  if (confirmation === 'inside') {
    return 'Dentro'
  }

  if (confirmation === 'outside') {
    return 'Fora'
  }

  return 'Pendente'
}

function getTeamLabel(team: TeamColor) {
  if (team === 'blue') {
    return 'Time Azul'
  }

  return 'Time Preto'
}

function getPositionLabel(
  position: RoundPosition,
) {
  if (position === 'goalkeeper') {
    return 'Goleiro'
  }

  if (position === 'reserve') {
    return 'Reserva'
  }

  return 'Linha'
}

function getOutcomeLabel(
  outcome: PlayerRoundOutcome,
) {
  if (outcome === 'win') {
    return 'Vitória'
  }

  if (outcome === 'loss') {
    return 'Derrota'
  }

  if (outcome === 'draw') {
    return 'Empate'
  }

  if (outcome === 'not-assigned') {
    return 'Fora da formação'
  }

  return 'Aguardando resultado'
}

export function PlayerPage({
  groupId,
  players,
  assignments,
  roundResult,
}: PlayerPageProps) {
  const { playerId } = useParams()

  const player = players.find(
    (currentPlayer) =>
      currentPlayer.id === playerId,
  )

  const [groupStats, setGroupStats] =
    useState<PlayerGroupStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] =
    useState(false)
  const [statsError, setStatsError] =
    useState<string | null>(null)

  const targetPlayerId = player?.id ?? null

  useEffect(() => {
    let ignoreResult = false

    async function loadPlayerGroupStats() {
      setGroupStats(null)
      setStatsError(null)

      if (!groupId || !targetPlayerId) {
        setIsLoadingStats(false)
        return
      }

      setIsLoadingStats(true)

      const { data, error } = await supabase.rpc(
        'get_player_group_stats',
        {
          target_group_id: groupId,
          target_player_id: targetPlayerId,
        },
      )

      if (ignoreResult) {
        return
      }

      setIsLoadingStats(false)

      if (error) {
        console.error(
          'Erro ao carregar estatísticas acumuladas do jogador:',
          error,
        )
        setStatsError(
          'Não foi possível carregar as estatísticas deste jogador.',
        )
        return
      }

      if (data === null) {
        setGroupStats(emptyPlayerGroupStats)
        return
      }

      if (!Array.isArray(data)) {
        console.error(
          'Erro ao carregar estatísticas acumuladas do jogador:',
          new Error(
            'A função não retornou uma lista de estatísticas.',
          ),
        )
        setStatsError(
          'Não foi possível carregar as estatísticas deste jogador.',
        )
        return
      }

      const statsRow = data[0] as
        | PlayerGroupStatsRow
        | undefined

      setGroupStats(
        statsRow
          ? normalizePlayerGroupStats(statsRow)
          : emptyPlayerGroupStats,
      )
    }

    void loadPlayerGroupStats()

    return () => {
      ignoreResult = true
    }
  }, [groupId, targetPlayerId])

  if (!player) {
    return (
      <section className="player-page">
        <Link className="back-link" to="/grupo">
          ← Voltar para o grupo
        </Link>

        <div className="empty-state">
          <h1>Jogador não encontrado</h1>
          <p>
            Não encontramos nenhum mensalista com esse
            identificador.
          </p>
        </div>
      </section>
    )
  }

  const playerAssignment = assignments.find(
  (assignment) =>
    assignment.playerId === player.id,
)

const playerOutcome = getPlayerRoundOutcome(
  player.id,
  assignments,
  roundResult,
)

  return (
    <section className="player-page">
      <Link className="back-link" to="/grupo">
        ← Voltar para o grupo
      </Link>

      <header className="player-profile">
        <span className="player-profile__avatar">
          {player.name.charAt(0)}
        </span>

        <div>
          <p className="eyebrow">Futebol da Raça</p>
          <h1>{player.name}</h1>

          <p>
            {player.role === 'admin'
              ? 'Administrador'
              : 'Mensalista'}
          </p>
        </div>
      </header>

      <section className="profile-card">
        <p className="eyebrow">Próxima rodada</p>

        <div className="profile-information-row">
          <span>Confirmação</span>

          <strong>
            {getConfirmationLabel(
              player.confirmation,
            )}
          </strong>
        </div>
      </section>

      <section className="profile-card">
  <p className="eyebrow">Rodada atual</p>
  <h2>Participação</h2>

  {playerAssignment ? (
    <div className="player-round-details">
      <div className="profile-information-row">
        <span>Time</span>

        <strong>
          {getTeamLabel(playerAssignment.team)}
        </strong>
      </div>

      <div className="profile-information-row">
        <span>Posição</span>

        <strong>
          {getPositionLabel(
            playerAssignment.position,
          )}
        </strong>
      </div>

      <div className="profile-information-row">
        <span>Resultado</span>

        <strong
          className={`outcome-badge outcome-badge--${playerOutcome}`}
        >
          {getOutcomeLabel(playerOutcome)}
        </strong>
      </div>

      {roundResult && (
        <div className="profile-round-score">
          <span>Time Azul</span>

          <strong>
            {roundResult.blueScore}
            {' × '}
            {roundResult.blackScore}
          </strong>

          <span>Time Preto</span>
        </div>
      )}
    </div>
  ) : (
    <p className="profile-placeholder">
      Este jogador não está na formação desta
      rodada.
    </p>
  )}
</section>

      <section className="profile-card">
        <p className="eyebrow">Estatísticas</p>
        <h2>Desempenho</h2>

        {isLoadingStats && (
          <p className="profile-placeholder">
            Carregando estatísticas...
          </p>
        )}

        {!isLoadingStats && statsError && (
          <p
            className="profile-stats-feedback profile-stats-feedback--error"
            role="status"
          >
            {statsError}
          </p>
        )}

        {!isLoadingStats &&
          !statsError &&
          groupStats && (
            <>
              <div className="profile-stats-grid">
                <div className="profile-stat-item">
                  <span>Partidas</span>
                  <strong>
                    {groupStats.matchesPlayed}
                  </strong>
                </div>

                <div className="profile-stat-item">
                  <span>Vitórias</span>
                  <strong>{groupStats.wins}</strong>
                </div>

                <div className="profile-stat-item">
                  <span>Empates</span>
                  <strong>{groupStats.draws}</strong>
                </div>

                <div className="profile-stat-item">
                  <span>Derrotas</span>
                  <strong>{groupStats.losses}</strong>
                </div>

                <div className="profile-stat-item">
                  <span>Gols</span>
                  <strong>{groupStats.goals}</strong>
                </div>

                <div className="profile-stat-item">
                  <span>Assistências</span>
                  <strong>{groupStats.assists}</strong>
                </div>

                <div className="profile-stat-item">
                  <span>Defesas</span>
                  <strong>
                    {groupStats.goalkeeperSaves}
                  </strong>
                </div>
              </div>

              {groupStats.matchesPlayed === 0 && (
                <p className="profile-stats-note">
                  As estatísticas serão atualizadas conforme
                  os resultados forem registrados.
                </p>
              )}
            </>
          )}

        {!isLoadingStats &&
          !statsError &&
          !groupStats && (
            <p className="profile-placeholder">
              Estatísticas indisponíveis para este grupo.
            </p>
          )}
      </section>
    </section>
  )
}
