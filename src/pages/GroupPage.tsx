import { PlayerList } from '../components/PlayerList'
import type { Player } from '../data/players'

type GroupPageProps = {
  players: Player[]
}

export function GroupPage({
  players,
}: GroupPageProps) {
  return (
    <section className="group-page">
      <div className="page-heading">
        <p className="eyebrow">Futebol da Raça</p>
        <h1>Grupo</h1>
        <p>
          Veja os mensalistas e a situação de cada jogador
          para a próxima rodada.
        </p>
      </div>

      <PlayerList players={players} />
    </section>
  )
}