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
  isEditing: boolean
  selectedPlayerId: string | null
  onSelectPlayer: (playerId: string) => void
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
  isEditing,
  selectedPlayerId,
  onSelectPlayer,
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
              <button
                className={`team-lineup-player__button ${
                  selectedPlayerId === player.id
                    ? 'team-lineup-player__button--selected'
                    : ''
                }`}
                type="button"
                disabled={!isEditing}
                onClick={() => onSelectPlayer(player.id)}
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
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}