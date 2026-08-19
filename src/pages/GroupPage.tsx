import { useEffect, useState } from 'react'

import {
  GroupPlayerList,
  type GroupPlayer,
} from '../components/GroupPlayerList'
import { supabase } from '../lib/supabase'

type GroupPageProps = {
  groupId: string | null
  groupName: string
}

type GroupMembershipRow = {
  role: 'admin' | 'member'
  players: {
    id: string
    name: string
    nickname: string | null
  } | null
}

export function GroupPage({
  groupId,
  groupName,
}: GroupPageProps) {
  const [groupPlayers, setGroupPlayers] =
    useState<GroupPlayer[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadGroupPlayers() {
      if (!groupId) {
        setGroupPlayers([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          role,
          players (
            id,
            name,
            nickname
          )
        `)
        .eq('group_id', groupId)
        .eq('active', true)
        .overrideTypes<
          GroupMembershipRow[],
          { merge: false }
        >()

      if (error) {
        setErrorMessage(
          'Não foi possível carregar os jogadores.',
        )

        setIsLoading(false)
        return
      }

      const players = data
        .filter(
          (membership) =>
            membership.players !== null,
        )
        .map((membership) => {
          const player = membership.players!

          return {
            id: player.id,
            name:
              player.nickname ??
              player.name,
            role: membership.role,
          }
        })
        .sort((firstPlayer, secondPlayer) =>
          firstPlayer.name.localeCompare(
            secondPlayer.name,
            'pt-BR',
          ),
        )

      setGroupPlayers(players)
      setIsLoading(false)
    }

    loadGroupPlayers()
  }, [groupId])

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

      {isLoading && (
        <p>Carregando jogadores...</p>
      )}

      {errorMessage && (
        <p>{errorMessage}</p>
      )}

      {!isLoading &&
        !errorMessage && (
          <GroupPlayerList
            players={groupPlayers}
          />
        )}
    </section>
  )
}