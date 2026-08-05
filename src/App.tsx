import './App.css'

function App() {
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
          <button className="confirmation-button confirmation-button--inside" type="button">
            Dentro
          </button>

          <button className="confirmation-button confirmation-button--outside" type="button">
            Fora
          </button>
        </div>
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
            <strong>10</strong>
            <span>Dentro</span>
          </div>

          <div className="summary-item">
            <strong>4</strong>
            <span>Fora</span>
          </div>

          <div className="summary-item">
            <strong>2</strong>
            <span>Pendentes</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App