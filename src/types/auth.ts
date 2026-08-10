export type AuthenticatedPlayer = {
  id: string
  name: string
  nickname: string | null
}

export type AuthenticatedGroup = {
  id: string
  name: string
}

export type AuthenticatedGroupMembership = {
  role: 'admin' | 'member'
  active: boolean
  groups: AuthenticatedGroup | null
}