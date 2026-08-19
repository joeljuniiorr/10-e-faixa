export type ConfirmationStatus =
  | 'inside'
  | 'outside'
  | 'pending'

export type PlayerRole = 'admin' | 'member'

export type Player = {
  id: string
  name: string
  role: PlayerRole
  confirmation: ConfirmationStatus
}