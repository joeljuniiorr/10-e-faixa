export type TeamColor = 'blue' | 'black'

export type RoundPosition =
  | 'line'
  | 'reserve'
  | 'goalkeeper'

export type RoundPlayerAssignment = {
  playerId: string
  team: TeamColor
  position: RoundPosition
}

import type { Player } from './players'

type InitialRoundAssignment = {
  playerName: string
  team: TeamColor
  position: RoundPosition
}

const initialRoundFormation: InitialRoundAssignment[] = [
  { playerName: 'Joel', team: 'blue', position: 'line' },
  { playerName: 'Jeleno', team: 'blue', position: 'line' },
  { playerName: 'Ambonatti', team: 'blue', position: 'line' },
  { playerName: 'Tiago G.', team: 'blue', position: 'line' },
  { playerName: 'Tiago Barriga', team: 'blue', position: 'line' },
  { playerName: 'Matheus G.', team: 'blue', position: 'line' },
  { playerName: 'Gustavo S.', team: 'blue', position: 'reserve' },
  { playerName: 'Samuel', team: 'blue', position: 'goalkeeper' },
  { playerName: 'Gustavo N.', team: 'blue', position: 'reserve' },

  { playerName: 'Ébone', team: 'black', position: 'line' },
  { playerName: 'Kailisson', team: 'black', position: 'line' },
  { playerName: 'Marconi', team: 'black', position: 'line' },
  { playerName: 'Raffa', team: 'black', position: 'line' },
  { playerName: 'Levi', team: 'black', position: 'line' },
  { playerName: 'Willian K.', team: 'black', position: 'line' },
  { playerName: 'Vini Miranda', team: 'black', position: 'reserve' },
  { playerName: 'Lucas F.', team: 'black', position: 'goalkeeper' },
  { playerName: 'Victor M.', team: 'black', position: 'reserve' },
]

export function createInitialRoundAssignments(
  players: Player[],
): RoundPlayerAssignment[] {
  return initialRoundFormation.flatMap(
    (formationPlayer) => {
      const player = players.find(
        (currentPlayer) =>
          currentPlayer.name ===
          formationPlayer.playerName,
      )

      if (!player) {
        return []
      }

      return [
        {
          playerId: player.id,
          team: formationPlayer.team,
          position: formationPlayer.position,
        },
      ]
    },
  )
}

export type RoundResult = {
  blueScore: number
  blackScore: number
}

export type RoundStatus =
  | 'scheduled'
  | 'finalized'
  | 'cancelled'

export type Round = {
  id: string
  groupId: string
  scheduledAt: string
  endsAt: string
  confirmationOpensAt: string
  confirmationClosesAt: string
  resultsOpenAt: string
  evaluationClosesAt: string
  status: RoundStatus
}