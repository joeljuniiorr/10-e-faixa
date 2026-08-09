import type {
  RoundPlayerAssignment,
  RoundResult,
  TeamColor,
} from '../data/round'

export type PlayerRoundOutcome =
  | 'win'
  | 'loss'
  | 'draw'
  | 'pending'
  | 'not-assigned'

export function getRoundWinningTeam(
  result: RoundResult | null,
): TeamColor | 'draw' | null {
  if (!result) {
    return null
  }

  if (result.blueScore > result.blackScore) {
    return 'blue'
  }

  if (result.blackScore > result.blueScore) {
    return 'black'
  }

  return 'draw'
}

export function getPlayerRoundOutcome(
  playerId: number,
  assignments: RoundPlayerAssignment[],
  result: RoundResult | null,
): PlayerRoundOutcome {
  const assignment = assignments.find(
    (currentAssignment) =>
      currentAssignment.playerId === playerId,
  )

  if (!assignment) {
    return 'not-assigned'
  }

  const winningTeam = getRoundWinningTeam(result)

  if (winningTeam === null) {
    return 'pending'
  }

  if (winningTeam === 'draw') {
    return 'draw'
  }

  if (assignment.team === winningTeam) {
    return 'win'
  }

  return 'loss'
}