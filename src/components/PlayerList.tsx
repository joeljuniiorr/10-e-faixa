import { Link } from 'react-router'

import type {
  ConfirmationStatus,
  Player,
} from '../data/players'

type PlayerListProps = {
  players: Player[]
}

function getConfirmationLabel(status: ConfirmationStatus) {
  if (status === 'inside') {
    return 'Dentro'
  }

  if (status === 'outside') {
    return 'Fora'
  }

  return 'Pendente'
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <section className="players-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Futebol da Raça</p>
          <h2>Mensalistas</h2>
        </div>
      </div>

      <ul className="players-list">
        {players.map((player) => (
          <li className="player-item" key={player.id}>
  <Link
    className="player-link"
    to={`/jogadores/${player.id}`}
  >
    <div className="player-information">
      <span className="player-avatar">
        {player.name.charAt(0)}
      </span>

      <div>
        <strong>{player.name}</strong>

        <span className="player-role">
          {player.role === 'admin'
            ? 'Administrador'
            : 'Mensalista'}
        </span>
      </div>
    </div>

    <span
      className={`confirmation-badge confirmation-badge--${player.confirmation}`}
    >
      {getConfirmationLabel(player.confirmation)}
    </span>
  </Link>
</li>
        ))}
      </ul>
    </section>
  )
}