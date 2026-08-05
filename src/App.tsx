import { useState } from 'react'
import './App.css'

function App() {
  const [confirmation, setConfirmation] = useState<
  'inside' | 'outside' | null
>(null)

const insideCount = 10 + (confirmation === 'inside' ? 1 : 0)
const outsideCount = 4 + (confirmation === 'outside' ? 1 : 0)
const pendingCount = confirmation === null ? 2 : 1

  return (
    <main className="app">
      <header className="app-header">
        <span className="brand">10 e Faixa</span>
        <button className="profile-button" type="button">
          JR
        </button>
      </header>

      <section className="welcome">
        <p className="eyebrow">Próxima rodada</p>
        <h1>Futebol da Raça</h1>
        <p>Segunda-feira, das 20h às 21h</p>
      </section>

      <section className="match-card">
        <div className="match-card__header">
          <div>
            <span className="status">Confirmações abertas</span>
            <h2>Você vai jogar?</h2>
          </div>

          <span className="match-time">20h</span>
        </div>

        <p className="deadline">
          Você pode responder ou alterar sua escolha até segunda-feira, às 16h.
        </p>

        <div className="confirmation-actions">
          <button
            className={`confirmation-button confirmation-button--inside ${
              confirmation === 'inside' ? 'confirmation-button--selected' : ''
            }`}
            type="button"
            aria-pressed={confirmation === 'inside'}
            onClick={() => setConfirmation('inside')}
          >
            Dentro
          </button>
          
          <button
            className={`confirmation-button confirmation-button--outside ${
              confirmation === 'outside' ? 'confirmation-button--selected' : ''
            }`}
            type="button"
            aria-pressed={confirmation === 'outside'}
            onClick={() => setConfirmation('outside')}
          >
            Fora
          </button>
        </div>

        <p className="confirmation-feedback" aria-live="polite">
          {confirmation === null && 'Você ainda não respondeu.'}
          {confirmation === 'inside' && 'Sua resposta atual: Dentro.'}
          {confirmation === 'outside' && 'Sua resposta atual: Fora.'}
        </p>

      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mensalistas</p>
            <h2>Confirmações</h2>
          </div>

          <span>16 jogadores</span>
        </div>

        <div className="summary-list">
          <div className="summary-item">
            <strong>{insideCount}</strong>
            <span>Dentro</span>
          </div>

          <div className="summary-item">
            <strong>{outsideCount}</strong>
            <span>Fora</span>
          </div>

          <div className="summary-item">
            <strong>{pendingCount}</strong>
            <span>Pendentes</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App