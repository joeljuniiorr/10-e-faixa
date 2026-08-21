import {
  createInitialRoundAssignments,
  type RoundPlayerAssignment,
  type RoundResult,
  type Round,
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
  getNextRoundDate,
} from './utils/roundDate'
import './App.css'
import type {
  AuthenticatedGroupMembership,
  AuthenticatedPlayer,
} from './types/auth'
type GroupRosterRow = {
  role: 'admin' | 'member'
  players: {
    id: string
    name: string
    nickname: string | null
  } | null
}

type RoundConfirmationRow = {
  player_id: string
  status: 'inside' | 'outside'
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

  const [activeRound, setActiveRound] =
  useState<Round | null>(null)

const activeRoundId = activeRound?.id

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

const roundDate = activeRound
  ? new Date(activeRound.scheduledAt)
  : getNextRoundDate(referenceDate)

const formattedRoundDate =
  formatRoundDate(roundDate)

const confirmationWindowStatus =
  !activeRound || activeRound.status !== 'scheduled'
    ? 'closed'
    : referenceDate <
        new Date(activeRound.confirmationOpensAt)
      ? 'not-started'
      : referenceDate <=
          new Date(activeRound.confirmationClosesAt)
        ? 'open'
        : 'closed'

const isConfirmationOpen =
  confirmationWindowStatus === 'open'

const isResultsOpen = Boolean(
  activeRound &&
    activeRound.status !== 'cancelled' &&
    referenceDate >=
      new Date(activeRound.resultsOpenAt),
)

let confirmationStatusText = 'Confirmações abertas'

let confirmationDeadlineText =
  'Você pode responder ou alterar sua escolha até segunda-feira, às 16h.'

if (confirmationWindowStatus === 'not-started') {
  confirmationStatusText =
    'Confirmações ainda não abertas'

  confirmationDeadlineText =
    'As confirmações abrem na terça-feira, às 21h.'
}

if (confirmationWindowStatus === 'closed') {
  confirmationStatusText =
    'Confirmações encerradas'

  confirmationDeadlineText =
    'O prazo de confirmação encerrou na segunda-feira, às 16h.'
}

  const currentPlayerConfirmation =
  currentPlayer?.confirmation

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
            confirmation: 'pending',
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
  async function loadActiveRound() {
    if (!activeGroup) {
      setActiveRound(null)
      return
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('rounds')
      .select(`
        id,
        group_id,
        scheduled_at,
        ends_at,
        confirmation_opens_at,
        confirmation_closes_at,
        results_open_at,
        evaluation_closes_at,
        status
      `)
      .eq('group_id', activeGroup.id)
      .gte('evaluation_closes_at', now)
      .neq('status', 'cancelled')
      .order('scheduled_at', {
        ascending: true,
      })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(
        'Erro ao carregar rodada:',
        error,
      )

      setActiveRound(null)
      return
    }

    if (!data) {
      setActiveRound(null)
      return
    }

    setActiveRound({
      id: data.id,
      groupId: data.group_id,
      scheduledAt: data.scheduled_at,
      endsAt: data.ends_at,
      confirmationOpensAt:
        data.confirmation_opens_at,
      confirmationClosesAt:
        data.confirmation_closes_at,
      resultsOpenAt: data.results_open_at,
      evaluationClosesAt:
        data.evaluation_closes_at,
      status: data.status,
    })
  }

  loadActiveRound()
}, [activeGroup?.id])

useEffect(() => {
  async function loadRoundConfirmations() {
    if (!activeRoundId || players.length === 0) {
      return
    }

    const { data, error } = await supabase
      .from('round_confirmations')
      .select('player_id, status')
      .eq('round_id', activeRoundId)
      .overrideTypes<
        RoundConfirmationRow[],
        { merge: false }
      >()

    if (error) {
      console.error(
        'Erro ao carregar confirmações da rodada:',
        error,
      )
      return
    }

    const confirmationsByPlayerId = new Map(
      data.map((confirmation) => [
        confirmation.player_id,
        confirmation.status,
      ]),
    )

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => ({
        ...player,
        confirmation:
          confirmationsByPlayerId.get(player.id) ??
          'pending',
      })),
    )
  }

  void loadRoundConfirmations()
}, [activeRoundId, players.length])

useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (event) => {
      if (event === 'SIGNED_IN') {
        setAuthStatus('authenticated')
      }

      if (event === 'SIGNED_OUT') {
        setActiveRound(null)
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

  async function handleConfirmation(
  newConfirmation: Exclude<
    ConfirmationStatus,
    'pending'
  >,
) {
  if (
    !isConfirmationOpen ||
    !authenticatedPlayer ||
    !activeRound
  ) {
    return
  }

  const { error } = await supabase
    .from('round_confirmations')
    .upsert(
      {
        round_id: activeRound.id,
        player_id: authenticatedPlayer.id,
        status: newConfirmation,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'round_id,player_id',
      },
    )

  if (error) {
    console.error(
      'Erro ao salvar confirmação da rodada:',
      error,
    )
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
  setActiveRound(null)
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
    !isResultsOpen ||
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
              currentPlayerConfirmation
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
            isResultsOpen={isResultsOpen}
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
