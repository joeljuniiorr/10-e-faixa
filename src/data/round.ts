export type TeamColor = 'blue' | 'black'

export type RoundPosition =
  | 'line'
  | 'reserve'
  | 'goalkeeper'

export type RoundPlayerAssignment = {
  playerId: number
  team: TeamColor
  position: RoundPosition
}

export const initialRoundAssignments: RoundPlayerAssignment[] = [
  {
    playerId: 1,
    team: 'blue',
    position: 'line',
  },
  {
    playerId: 2,
    team: 'blue',
    position: 'line',
  },
  {
    playerId: 3,
    team: 'blue',
    position: 'line',
  },
  {
    playerId: 4,
    team: 'blue',
    position: 'line',
  },
  {
    playerId: 5,
    team: 'blue',
    position: 'line',
  },
  {
    playerId: 6,
    team: 'blue',
    position: 'line',
  },
  {
    playerId: 7,
    team: 'blue',
    position: 'reserve',
  },
  {
    playerId: 8,
    team: 'blue',
    position: 'goalkeeper',
  },

  {
    playerId: 9,
    team: 'black',
    position: 'line',
  },
  {
    playerId: 10,
    team: 'black',
    position: 'line',
  },
  {
    playerId: 11,
    team: 'black',
    position: 'line',
  },
  {
    playerId: 12,
    team: 'black',
    position: 'line',
  },
  {
    playerId: 13,
    team: 'black',
    position: 'line',
  },
  {
    playerId: 14,
    team: 'black',
    position: 'line',
  },
  {
    playerId: 15,
    team: 'black',
    position: 'reserve',
  },
  {
    playerId: 16,
    team: 'black',
    position: 'goalkeeper',
  },

  {
  playerId: 17,
  team: 'blue',
  position: 'reserve',
},

{
  playerId: 18,
  team: 'black',
  position: 'reserve',
},

]