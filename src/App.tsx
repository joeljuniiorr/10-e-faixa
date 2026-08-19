import {
  createInitialRoundAssignments,
  type RoundPlayerAssignment,
  type RoundResult,
} from './data/round'
import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router'
import { BottomNavigation } from './components/BottomNavigation'
import { GroupPage } from './pages/GroupPage'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { PlayerPage } from './pages/PlayerPage'
import { GamesPage } from './pages/GamesPage'
import { supabase } from './lib/supabase'
import type {
  ConfirmationStatus,
  Player,
} from './data/players'
import {
  formatRoundDate,
  getConfirmationWindow,
  getNextRoundDate,
  getResultsWindow,
} from './utils/roundDate'
import './App.css'
import type {
  AuthenticatedGroupMembership,
  AuthenticatedPlayer,
} from './types/auth'


const currentPlayerId = 1

const confirmationStorageKey =
  '10-e-faixa:futebol-da-raca:joel-confirmation'

const confirmationStorageKeyPrefix =
  '10-e-faixa:confirmation'

function getConfirmationStorageKey(
  playerId: string,
) {
  return `${confirmationStorageKeyPrefix}:${playerId}`
}

function getSavedConfirmation(
  playerId: string,
): ConfirmationStatus {
  const savedConfirmation = localStorage.getItem(
    getConfirmationStorageKey(playerId),
  )

  if (
    savedConfirmation === 'inside' ||
    savedConfirmation === 'outside' ||
    savedConfirmation === 'pending'
  ) {
    return savedConfirmation
  }

  return 'pending'
}

type GroupRosterRow = {
  role: 'admin' | 'member'
  players: {
    id: string
    name: string
    nickname: string | null
  } | null
}

function App() {
  const [players, setPlayers] =
  useState<Player[]>([])

  const [
  authenticatedGroupMemberships,
  setAuthenticatedGroupMemberships,
] = useState<AuthenticatedGroupMembership[]>([])

const [
  authenticatedPlayer,
  setAuthenticatedPlayer,
] = useState<AuthenticatedPlayer | null>(null)

const [authStatus, setAuthStatus] =
  useState<
    'loading' | 'authenticated' | 'anonymous'
  >('loading')

const [
  roundAssignments,
  setRoundAssignments,
] = useState<RoundPlayerAssignment[]>([])

  const [roundResult, setRoundResult] =
  useState<RoundResult | null>(null)

const activeGroup =
    authenticatedGroupMemberships.find(
      (membership) =>
        membership.active &&
        membership.groups,
    )?.groups ?? null

  const currentPlayer = players.find(
    (player) =>
      player.id === authenticatedPlayer?.id,
  )

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

  const currentPlayerConfirmation =
  currentPlayer?.confirmation

  useEffect(() => {
  if (
    !currentPlayer ||
    !currentPlayerConfirmation
  ) {
    return
  }

  localStorage.setItem(
    getConfirmationStorageKey(
      currentPlayer.id,
    ),
    currentPlayerConfirmation,
  )
}, [
  currentPlayer?.id,
  currentPlayerConfirmation,
])

  useEffect(() => {
  async function restoreAuthenticatedGroup() {
    const { data: sessionData } =
      await supabase.auth.getSession()

    const user = sessionData.session?.user

if (!user) {
  setAuthStatus('anonymous')
  return
}

setAuthStatus('authenticated')

    const {
      data: player,
      error: playerError,
    } = await supabase
      .from('players')
      .select('id, name, nickname')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (playerError || !player) {
      return
    }

    setAuthenticatedPlayer(player)

    const {
      data: memberships,
      error: membershipsError,
    } = await supabase
      .from('group_members')
      .select(`
        role,
        active,
        groups (
          id,
          name
        )
      `)
      .eq('player_id', player.id)
      .eq('active', true)
      .overrideTypes<
        AuthenticatedGroupMembership[],
        { merge: false }
      >()

    if (
      membershipsError ||
      !memberships
    ) {
      return
    }

    setAuthenticatedGroupMemberships(
      memberships,
    )
  }

  restoreAuthenticatedGroup()
}, [])

useEffect(() => {
  async function loadGroupPlayers() {
    if (!activeGroup || !authenticatedPlayer) {
      setPlayers([])
      setRoundAssignments([])
      return
    }

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        role,
        players (
          id,
          name,
          nickname
        )
      `)
      .eq('group_id', activeGroup.id)
      .eq('active', true)
      .overrideTypes<
        GroupRosterRow[],
        { merge: false }
      >()

    if (error) {
      console.error(
        'Erro ao carregar jogadores:',
        error,
      )
      return
    }

    const loadedPlayers: Player[] =
      data.flatMap((membership) => {
        const player = membership.players

        if (!player) {
          return []
        }

        return [
          {
            id: player.id,
            name:
              player.nickname ??
              player.name,
            role: membership.role,
            confirmation:
              player.id === authenticatedPlayer.id
                ? getSavedConfirmation(player.id)
                : 'pending',
          },
        ]
      })

    setPlayers(loadedPlayers)

    setRoundAssignments(
      createInitialRoundAssignments(
        loadedPlayers,
      ),
    )
  }

  void loadGroupPlayers()
}, [activeGroup?.id, authenticatedPlayer?.id])

useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (event) => {
      if (event === 'SIGNED_IN') {
        setAuthStatus('authenticated')
      }

      if (event === 'SIGNED_OUT') {
        setAuthenticatedPlayer(null)
        setAuthenticatedGroupMemberships([])
        setPlayers([])
        setRoundAssignments([])
        setAuthStatus('anonymous')
      }
    },
  )

  return () => {
    subscription.unsubscribe()
  }
}, [])

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
  newConfirmation: Exclude<
    ConfirmationStatus,
    'pending'
  >,
) {
  if (
    !isConfirmationOpen ||
    !authenticatedPlayer
  ) {
    return
  }

  setPlayers((currentPlayers) =>
    currentPlayers.map((player) => {
      if (
        player.id === authenticatedPlayer.id
      ) {
        return {
          ...player,
          confirmation: newConfirmation,
        }
      }

      return player
    }),
  )
}

function handleAuthenticated(
  player: AuthenticatedPlayer,
  memberships: AuthenticatedGroupMembership[],
) {
  setAuthenticatedPlayer(player)
  setAuthenticatedGroupMemberships(memberships)
  setAuthStatus('authenticated')
}

function handleSignedOut() {
  setAuthenticatedPlayer(null)
  setAuthenticatedGroupMemberships([])
  setPlayers([])
  setRoundAssignments([])
  setAuthStatus('anonymous')
}

function handleSwapPlayers(
  firstPlayerId: string,
  secondPlayerId: string,
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

if (authStatus === 'loading') {
  return (
    <main>
      <p>Carregando 10 e Faixa...</p>
    </main>
  )
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
          authStatus === 'authenticated' ? (
          <HomePage
          groupName={
            activeGroup?.name ?? '10 e Faixa'
          }
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
          ) : (
            <Navigate
            to="/entrar"
            replace
          />
          )
        }
      />

      <Route
  path="/entrar"
  element={
    <LoginPage
      onAuthenticated={handleAuthenticated}
      onSignedOut={handleSignedOut}
    />
  }
/>

      <Route
        path="/jogos"
        element={ authStatus === 'authenticated' ? (
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
        ) : (
          <Navigate
        to="/entrar"
        replace
        />
        )
        }
      />

      <Route
        path="/grupo"
        element= {  authStatus === 'authenticated' ? (
        <GroupPage
          groupName={
            activeGroup?.name ?? '10 e Faixa'
          }
          players={players}
        />
        ) : (
          <Navigate
            to="/entrar"
            replace
          />
        )
      }
      />

      <Route
        path="/jogadores/:playerId"
        element={  authStatus === 'authenticated' ? (
          <PlayerPage
            players={players}
            assignments={roundAssignments}
            roundResult={roundResult}
          />
        ) : (
          <Navigate
            to="/entrar"
            replace
            />
        )
        }
      />
    </Routes>

    <BottomNavigation />
  </main>
)
}

export default App