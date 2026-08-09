import {
  initialRoundAssignments,
  type RoundResult,
} from './data/round'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import { BottomNavigation } from './components/BottomNavigation'
import { GroupPage } from './pages/GroupPage'
import { HomePage } from './pages/HomePage'
import { PlayerPage } from './pages/PlayerPage'
import { GamesPage } from './pages/GamesPage'
import {
  initialPlayers,
  type ConfirmationStatus,
  type Player,
} from './data/players'
import {
  formatRoundDate,
  getConfirmationWindow,
  getNextRoundDate,
  getResultsWindow,
} from './utils/roundDate'
import './App.css'

const currentPlayerId = 1

const confirmationStorageKey =
  '10-e-faixa:futebol-da-raca:joel-confirmation'

function getInitialPlayers(): Player[] {
  const savedConfirmation = localStorage.getItem(
    confirmationStorageKey,
  )

  if (
    savedConfirmation !== 'inside' &&
    savedConfirmation !== 'outside' &&
    savedConfirmation !== 'pending'
  ) {
    return initialPlayers
  }

  return initialPlayers.map((player) => {
    if (player.id === currentPlayerId) {
      return {
        ...player,
        confirmation: savedConfirmation,
      }
    }

    return player
  })
}

function App() {
  const [players, setPlayers] = useState(getInitialPlayers)

  const [roundAssignments, setRoundAssignments] =
  useState(initialRoundAssignments)

  const [roundResult, setRoundResult] =
  useState<RoundResult | null>(null)

const referenceDate = new Date()

const nextRoundDate = getNextRoundDate(referenceDate)

const formattedRoundDate =
  formatRoundDate(nextRoundDate)

const confirmationWindow = getConfirmationWindow(
  nextRoundDate,
  referenceDate,
)

const resultsWindow = getResultsWindow(
  nextRoundDate,
  referenceDate,
)

const isConfirmationOpen = confirmationWindow.isOpen

let confirmationStatusText = 'Confirmações abertas'

let confirmationDeadlineText =
  'Você pode responder ou alterar sua escolha até segunda-feira, às 16h.'

if (confirmationWindow.status === 'not-started') {
  confirmationStatusText =
    'Confirmações ainda não abertas'

  confirmationDeadlineText =
    'As confirmações abrem na terça-feira, às 21h.'
}

if (confirmationWindow.status === 'closed') {
  confirmationStatusText =
    'Confirmações encerradas'

  confirmationDeadlineText =
    'O prazo de confirmação encerrou na segunda-feira, às 16h.'
}
 
  const currentPlayer = players.find(
    (player) => player.id === currentPlayerId,
  )

  const currentPlayerConfirmation =
  currentPlayer?.confirmation

  useEffect(() => {
    if (!currentPlayerConfirmation) {
      return
    }

    localStorage.setItem(
      confirmationStorageKey,
      currentPlayerConfirmation,
    )
  }, [currentPlayerConfirmation])

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
  if (!isConfirmationOpen) {
    return
  }

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

function handleSwapPlayers(
  firstPlayerId: number,
  secondPlayerId: number,
) {
  if (currentPlayer?.role !== 'admin') {
    return
  }

  if (firstPlayerId === secondPlayerId) {
    return
  }

  setRoundAssignments((currentAssignments) =>
    currentAssignments.map((assignment) => {
      if (assignment.playerId === firstPlayerId) {
        return {
          ...assignment,
          playerId: secondPlayerId,
        }
      }

      if (assignment.playerId === secondPlayerId) {
        return {
          ...assignment,
          playerId: firstPlayerId,
        }
      }

      return assignment
    }),
  )
}

function handleSaveRoundResult(
  blueScore: number,
  blackScore: number,
) {
  if (
    !resultsWindow.isOpen ||
    currentPlayer?.role !== 'admin'
  ) {
    return
  }

  if (
    blueScore < 0 ||
    blackScore < 0 ||
    !Number.isInteger(blueScore) ||
    !Number.isInteger(blackScore)
  ) {
    return
  }

  setRoundResult({
    blueScore,
    blackScore,
  })
}

return (
  <main className="app">
    <header className="app-header">
      <span className="brand">10 e Faixa</span>

      <button
        className="profile-button"
        type="button"
      >
        JR
      </button>
    </header>

    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            formattedRoundDate={formattedRoundDate}
            currentConfirmation={
              currentPlayer?.confirmation
            }
            isConfirmationOpen={isConfirmationOpen}
            confirmationStatusText={
              confirmationStatusText
            }
            confirmationDeadlineText={
              confirmationDeadlineText
            }
            insideCount={insideCount}
            outsideCount={outsideCount}
            pendingCount={pendingCount}
            playersCount={players.length}
            onConfirm={handleConfirmation}
          />
        }
      />

      <Route
        path="/jogos"
        element={
          <GamesPage
            formattedRoundDate={formattedRoundDate}
            isResultsOpen={resultsWindow.isOpen}
            isAdmin={currentPlayer?.role === 'admin'}
            players={players}
            assignments={roundAssignments}
            roundResult={roundResult}
            onSwapPlayers={handleSwapPlayers}
            onSaveRoundResult={handleSaveRoundResult}
          />
        }
      />

      <Route
        path="/grupo"
        element={<GroupPage players={players} />}
      />

      <Route
        path="/jogadores/:playerId"
        element={<PlayerPage players={players} />}
      />
    </Routes>

    <BottomNavigation />
  </main>
)
}

export default App