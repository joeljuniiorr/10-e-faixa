import { useState } from 'react'
import { PlayerList } from './components/PlayerList'
import {
  initialPlayers,
  type ConfirmationStatus,
} from './data/players'
import './App.css'

function App() {
  const [players, setPlayers] = useState(initialPlayers)

  const currentPlayerId = 1

  const currentPlayer = players.find(
    (player) => player.id === currentPlayerId,
  )

  const insideCount = players.filter(
    (player) => player.confirmation === 'inside',
  ).length

  const outsideCount = players.filter(
    (player) => player.confirmation === 'outside',
  ).length

  const pendingCount = players.filter(
    (player) => player.confirmation === 'pending',
  ).length

  function handleConfirmation(
    newConfirmation: Exclude<ConfirmationStatus, 'pending'>,
  ) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => {
        if (player.id === currentPlayerId) {
          return {
            ...player,
            confirmation: newConfirmation,
          }
        }

        return player
      }),
    )
  }

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
              currentPlayer?.confirmation === 'inside'
                ? 'confirmation-button--selected'
                : ''
            }`}
            type="button"
            aria-pressed={currentPlayer?.confirmation === 'inside'}
            onClick={() => handleConfirmation('inside')}
          >
            Dentro
          </button>

          <button
            className={`confirmation-button confirmation-button--outside ${
              currentPlayer?.confirmation === 'outside'
                ? 'confirmation-button--selected'
                : ''
            }`}
            type="button"
            aria-pressed={currentPlayer?.confirmation === 'outside'}
            onClick={() => handleConfirmation('outside')}
          >
            Fora
          </button>
        </div>

        <p className="confirmation-feedback" aria-live="polite">
          {currentPlayer?.confirmation === 'pending' &&
            'Você ainda não respondeu.'}

          {currentPlayer?.confirmation === 'inside' &&
            'Sua resposta atual: Dentro.'}

          {currentPlayer?.confirmation === 'outside' &&
            'Sua resposta atual: Fora.'}
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mensalistas</p>
            <h2>Confirmações</h2>
          </div>

          <span>{players.length} jogadores</span>
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

     <PlayerList players={players} />
     
    </main>
  )
}

export default App