import { GroupPlayerList } from '../components/GroupPlayerList'
import type { Player } from '../data/players'

type GroupPageProps = {
  groupName: string
  players: Player[]
}

export function GroupPage({
  groupName,
  players,
}: GroupPageProps) {
  return (
    <section className="group-page">
      <div className="page-heading">
        <p className="eyebrow">
          {groupName}
        </p>

        <h1>Grupo</h1>

        <p>
          Veja os mensalistas participantes
          deste grupo.
        </p>
      </div>

      <GroupPlayerList players={players} />
    </section>
  )
}