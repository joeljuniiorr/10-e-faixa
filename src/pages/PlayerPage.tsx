import { Link, useParams } from 'react-router'
import type { Player } from '../data/players'
import type {
  RoundPlayerAssignment,
  RoundPosition,
  RoundResult,
  TeamColor,
} from '../data/round'

import {
  getPlayerRoundOutcome,
  type PlayerRoundOutcome,
} from '../utils/playerRoundOutcome'

type PlayerPageProps = {
  players: Player[]
  assignments: RoundPlayerAssignment[]
  roundResult: RoundResult | null
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
  players,
  assignments,
  roundResult,
}: PlayerPageProps) {
  const { playerId } = useParams()

  const player = players.find(
    (currentPlayer) =>
      currentPlayer.id === playerId,
  )

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

        <p className="profile-placeholder">
          Gols, assistências, partidas, vitórias,
          derrotas e avaliações aparecerão aqui quando
          implementarmos o registro das partidas.
        </p>
      </section>
    </section>
  )
}