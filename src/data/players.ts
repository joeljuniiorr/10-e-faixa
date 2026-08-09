export type ConfirmationStatus = 'inside' | 'outside' | 'pending'

export type PlayerRole = 'admin' | 'member'

export type Player = {
  id: number
  name: string
  role: PlayerRole
  confirmation: ConfirmationStatus
}

export const initialPlayers: Player[] = [
  {
    id: 1,
    name: 'Joel',
    role: 'admin',
    confirmation: 'pending',
  },
  {
    id: 2,
    name: 'Jeleno',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 3,
    name: 'Ambonatti',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 4,
    name: 'Tiago G.',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 5,
    name: 'Tiago Barriga',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 6,
    name: 'Matheus G.',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 7,
    name: 'Gustavo S.',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 8,
    name: 'Samuel',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 9,
    name: 'Ébone',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 10,
    name: 'Kailisson',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 11,
    name: 'Marconi',
    role: 'member',
    confirmation: 'inside',
  },
  {
    id: 12,
    name: 'Raffa',
    role: 'member',
    confirmation: 'outside',
  },
  {
    id: 13,
    name: 'Levi',
    role: 'member',
    confirmation: 'outside',
  },
  {
    id: 14,
    name: 'Willian K.',
    role: 'member',
    confirmation: 'outside',
  },
  {
    id: 15,
    name: 'Vini Miranda',
    role: 'member',
    confirmation: 'outside',
  },
  {
    id: 16,
    name: 'Lucas F.',
    role: 'member',
    confirmation: 'pending',
  },

  {
  id: 17,
  name: 'Gustavo N.',
  role: 'member',
  confirmation: 'pending',
},
{
  id: 18,
  name: 'Victor M.',
  role: 'member',
  confirmation: 'pending',
},

]