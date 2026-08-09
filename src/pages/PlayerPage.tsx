import { Link, useParams } from 'react-router'
import type { Player } from '../data/players'

type PlayerPageProps = {
  players: Player[]
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

export function PlayerPage({
  players,
}: PlayerPageProps) {
  const { playerId } = useParams()

  const player = players.find(
    (currentPlayer) =>
      currentPlayer.id === Number(playerId),
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