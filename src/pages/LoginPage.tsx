import { useState } from 'react'
import { supabase } from '../lib/supabase'

type AuthenticatedPlayer = {
  id: string
  name: string
  nickname: string | null
}

type AuthenticatedGroupMembership = {
  role: 'admin' | 'member'
  active: boolean
  groups: {
    id: string
    name: string
  } | null
}

export function LoginPage() {
  const [player, setPlayer] =
  useState<AuthenticatedPlayer | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [groupMemberships, setGroupMemberships] =
  useState<AuthenticatedGroupMembership[]>([])

  async function handleSignUp() {
    setIsLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setIsLoading(false)
      return
    }

    setMessage(
      'Conta criada. Verifique seu e-mail para confirmar o cadastro.',
    )

    setIsLoading(false)
  }

  async function loadAuthenticatedGroups(
  playerId: string,
) {
  const { data, error } = await supabase
  .from('group_members')
  .select(`
    role,
    active,
    groups (
      id,
      name
    )
  `)
  .eq('player_id', playerId)
  .eq('active', true)
  .overrideTypes<
    AuthenticatedGroupMembership[],
    { merge: false }
  >()
  if (error) {
    setMessage(
      `Não foi possível carregar os grupos: ${error.message}`,
    )

    return false
  }

  if (!data || data.length === 0) {
    setMessage(
      'Login realizado, mas nenhum grupo ativo foi encontrado para este jogador.',
    )

    return false
  }

  setGroupMemberships(data)

  return true
}

  async function loadAuthenticatedPlayer(
  userId: string,
) {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, nickname')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (error) {
    setMessage(
      `Login realizado, mas não foi possível carregar o jogador: ${error.message}`,
    )

    return false
  }

  if (!data) {
    setMessage(
      'Login realizado, mas nenhum jogador foi encontrado para esta conta.',
    )

    return false
  }

  setPlayer(data)

  const groupsLoaded =
    await loadAuthenticatedGroups(data.id)

  if (!groupsLoaded) {
    return false
  }

  return true
}

  async function handleSignIn() {
    setIsLoading(true)
    setMessage('')

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setMessage(error.message)
      setIsLoading(false)
      return
    }

    if (!data.user) {
  setMessage(
    'O login foi realizado, mas o usuário não foi encontrado.',
  )

  setIsLoading(false)
  return
}

const playerLoaded =
  await loadAuthenticatedPlayer(data.user.id)

if (playerLoaded) {
  setMessage('Login realizado com sucesso.')
}

setIsLoading(false)

  }

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">10 e Faixa</p>

        <h1>Entrar</h1>

        <p>
          Entre na sua conta para acessar seu
          grupo e suas rodadas.
        </p>

        <div className="login-form">
          <label>
            E-mail

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="seu@email.com"
            />
          </label>

          <label>
            Senha

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Sua senha"
            />
          </label>

          <button
            className="primary-action-button"
            type="button"
            disabled={isLoading}
            onClick={handleSignIn}
          >
            {isLoading ? 'Aguarde...' : 'Entrar'}
          </button>

          <button
            className="secondary-action-button"
            type="button"
            disabled={isLoading}
            onClick={handleSignUp}
          >
            Criar conta
          </button>

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

          {player && (
            <div className="authenticated-player-card">
              <span>Jogador conectado</span>

              <strong>
                {player.nickname ?? player.name}
              </strong>

              {player.nickname && (
                <small>{player.name}</small>
              )}

              {groupMemberships.map((membership) => {
  const group = membership.groups

  if (!group) {
    return null
  }

  return (
    <div
      className="authenticated-player-card authenticated-group-card"
      key={group.id}
    >
      <span>Grupo</span>

      <strong>{group.name}</strong>

      <small>
        {membership.role === 'admin'
          ? 'Administrador'
          : 'Membro'}
      </small>
    </div>
  )
})}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}