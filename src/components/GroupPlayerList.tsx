import { Link } from 'react-router'

export type GroupPlayer = {
  id: string
  name: string
  role: 'admin' | 'member'
}

type GroupPlayerListProps = {
  players: GroupPlayer[]
}

export function GroupPlayerList({
  players,
}: GroupPlayerListProps) {
  return (
    <section className="players-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            Futebol da Raça
          </p>

          <h2>Mensalistas</h2>
        </div>
      </div>

      <ul className="players-list">
        {players.map((player) => (
          <li
            className="player-item"
            key={player.id}
          >
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
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}