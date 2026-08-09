import type { Player } from '../data/players'
import type {
  RoundPlayerAssignment,
  RoundPosition,
  TeamColor,
} from '../data/round'

type TeamLineupCardProps = {
  team: TeamColor
  players: Player[]
  assignments: RoundPlayerAssignment[]
}

function getTeamName(team: TeamColor) {
  if (team === 'blue') {
    return 'Time Azul'
  }

  return 'Time Preto'
}

function getPositionLabel(position: RoundPosition) {
  if (position === 'goalkeeper') {
    return 'Goleiro'
  }

  if (position === 'reserve') {
    return 'Reserva'
  }

  return 'Linha'
}

export function TeamLineupCard({
  team,
  players,
  assignments,
}: TeamLineupCardProps) {
  const teamAssignments = assignments.filter(
    (assignment) => assignment.team === team,
  )

  return (
    <section
      className={`team-lineup-card team-lineup-card--${team}`}
    >
      <div className="team-lineup-card__header">
        <div>
          <p className="eyebrow">Formação</p>
          <h3>{getTeamName(team)}</h3>
        </div>

        <span>{teamAssignments.length} jogadores</span>
      </div>

      <ul className="team-lineup-list">
        {teamAssignments.map((assignment) => {
          const player = players.find(
            (currentPlayer) =>
              currentPlayer.id === assignment.playerId,
          )

          if (!player) {
            return null
          }

          return (
            <li
              className="team-lineup-player"
              key={player.id}
            >
              <div className="team-lineup-player__information">
                <span className="player-avatar">
                  {player.name.charAt(0)}
                </span>

                <strong>{player.name}</strong>
              </div>

              <span
                className={`position-badge position-badge--${assignment.position}`}
              >
                {getPositionLabel(assignment.position)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}