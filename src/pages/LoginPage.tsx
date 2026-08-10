import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  async function handleSignIn() {
    setIsLoading(true)
    setMessage('')

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setMessage(error.message)
      setIsLoading(false)
      return
    }

    setMessage('Login realizado com sucesso.')

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
        </div>
      </div>
    </section>
  )
}