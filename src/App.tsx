import {
  createInitialRoundAssignments,
  type RoundPlayerAssignment,
  type RoundResult,
  type Round,
} from './data/round'
import { useEffect, useRef, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router'
import { BottomNavigation } from './components/BottomNavigation'
import { GroupPage } from './pages/GroupPage'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { PlayerPage } from './pages/PlayerPage'
import { GamesPage } from './pages/GamesPage'
import { EvaluationPage } from './pages/EvaluationPage'
import { HistoryPage } from './pages/HistoryPage'
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

type RoundAssignmentRow = {
  player_id: string
  team: RoundPlayerAssignment['team']
  position: RoundPlayerAssignment['position']
}

type RoundResultRow = {
  blue_score: number
  black_score: number
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

const activeRoundIdRef =
  useRef<string | undefined>(undefined)

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

const isEvaluationClosed = Boolean(
  activeRound &&
    (activeRound.evaluationClosedAt !== null ||
      referenceDate >=
        new Date(activeRound.evaluationClosesAt)),
)

const isEvaluationOpen = Boolean(
  activeRound &&
    activeRound.status === 'scheduled' &&
    referenceDate >=
      new Date(activeRound.resultsOpenAt) &&
    !isEvaluationClosed,
)

let evaluationStatusText =
  'Não há uma rodada ativa para avaliação.'

if (
  activeRound &&
  activeRound.status === 'scheduled' &&
  !isEvaluationClosed &&
  referenceDate < new Date(activeRound.resultsOpenAt)
) {
  evaluationStatusText =
    'As avaliações estarão disponíveis após o jogo.'
}

if (isEvaluationOpen) {
  evaluationStatusText =
    'Avalie os demais participantes antes do encerramento da janela.'
}

if (activeRound && !isEvaluationOpen) {
  const evaluationHasNotStarted =
    activeRound.status === 'scheduled' &&
    !isEvaluationClosed &&
    referenceDate < new Date(activeRound.resultsOpenAt)

  if (!evaluationHasNotStarted) {
    evaluationStatusText =
      'A janela de avaliação está encerrada.'
  }
}

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
  }

  void loadGroupPlayers()
}, [activeGroup?.id, authenticatedPlayer?.id])

useEffect(() => {
  let ignoreResult = false

  async function loadActiveRound() {
    activeRoundIdRef.current = undefined
    setActiveRound(null)
    setRoundAssignments([])
    setRoundResult(null)

    if (!activeGroup) {
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
        evaluation_closed_at,
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

    if (ignoreResult) {
      return
    }

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

    activeRoundIdRef.current = data.id

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
      evaluationClosedAt:
        data.evaluation_closed_at,
      status: data.status,
    })
  }

  void loadActiveRound()

  return () => {
    ignoreResult = true
    activeRoundIdRef.current = undefined
  }
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
  let ignoreResult = false

  async function loadRoundAssignments() {
    if (!activeRoundId || players.length === 0) {
      return
    }

    const { data, error } = await supabase
      .from('round_assignments')
      .select('player_id, team, position')
      .eq('round_id', activeRoundId)
      .overrideTypes<
        RoundAssignmentRow[],
        { merge: false }
      >()

    if (ignoreResult) {
      return
    }

    if (error) {
      console.error(
        'Erro ao carregar formação da rodada:',
        error,
      )
      return
    }

    if (data.length === 0) {
      setRoundAssignments(
        createInitialRoundAssignments(players),
      )
      return
    }

    setRoundAssignments(
      data.map((assignment) => ({
        playerId: assignment.player_id,
        team: assignment.team,
        position: assignment.position,
      })),
    )
  }

  void loadRoundAssignments()

  return () => {
    ignoreResult = true
  }
}, [activeRoundId, players])

useEffect(() => {
  let ignoreResult = false

  async function loadRoundResult() {
    if (!activeRoundId) {
      return
    }

    const { data, error } = await supabase
      .from('round_results')
      .select('blue_score, black_score')
      .eq('round_id', activeRoundId)
      .maybeSingle()
      .overrideTypes<
        RoundResultRow | null,
        { merge: false }
      >()

    if (ignoreResult) {
      return
    }

    if (error) {
      console.error(
        'Erro ao carregar resultado da rodada:',
        error,
      )
      return
    }

    if (!data) {
      setRoundResult(null)
      return
    }

    setRoundResult({
      blueScore: data.blue_score,
      blackScore: data.black_score,
    })
  }

  void loadRoundResult()

  return () => {
    ignoreResult = true
  }
}, [activeRoundId])

useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (event) => {
      if (event === 'SIGNED_IN') {
        setAuthStatus('authenticated')
      }

      if (event === 'SIGNED_OUT') {
        activeRoundIdRef.current = undefined
        setActiveRound(null)
        setAuthenticatedPlayer(null)
        setAuthenticatedGroupMemberships([])
        setPlayers([])
        setRoundAssignments([])
        setRoundResult(null)
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
  activeRoundIdRef.current = undefined
  setAuthenticatedPlayer(null)
  setAuthenticatedGroupMemberships([])
  setPlayers([])
  setRoundAssignments([])
  setRoundResult(null)
  setAuthStatus('anonymous')
  setActiveRound(null)
}

function handleEvaluationClosed(
  roundId: string,
  closedAt: string,
) {
  setActiveRound((currentRound) => {
    if (
      !currentRound ||
      currentRound.id !== roundId
    ) {
      return currentRound
    }

    return {
      ...currentRound,
      evaluationClosedAt: closedAt,
    }
  })
}

async function handleSwapPlayers(
  firstPlayerId: string,
  secondPlayerId: string,
) {
  if (
    currentPlayer?.role !== 'admin' ||
    !activeRound
  ) {
    return
  }

  if (firstPlayerId === secondPlayerId) {
    return
  }

  const roundId = activeRound.id

  const nextAssignments = roundAssignments.map(
    (assignment) => {
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
    },
  )

  const updatedAt = new Date().toISOString()

  const { error } = await supabase
    .from('round_assignments')
    .upsert(
      nextAssignments.map((assignment) => ({
        round_id: roundId,
        player_id: assignment.playerId,
        team: assignment.team,
        position: assignment.position,
        updated_at: updatedAt,
      })),
      {
        onConflict: 'round_id,player_id',
      },
    )

  if (error) {
    console.error(
      'Erro ao salvar formação da rodada:',
      error,
    )
    return
  }

  if (activeRoundIdRef.current !== roundId) {
    return
  }

  setRoundAssignments(nextAssignments)
}

async function handleSaveRoundResult(
  blueScore: number,
  blackScore: number,
) {
  if (
    !isResultsOpen ||
    currentPlayer?.role !== 'admin' ||
    !activeRound ||
    !authenticatedPlayer
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

  const roundId = activeRound.id

  const { error } = await supabase
    .from('round_results')
    .upsert(
      {
        round_id: roundId,
        blue_score: blueScore,
        black_score: blackScore,
        updated_by: authenticatedPlayer.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'round_id',
      },
    )

  if (error) {
    console.error(
      'Erro ao salvar resultado da rodada:',
      error,
    )
    return
  }

  if (activeRoundIdRef.current !== roundId) {
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
            isEvaluationOpen={isEvaluationOpen}
            evaluationStatusText={
              evaluationStatusText
            }
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
        path="/avaliacoes"
        element={
          authStatus === 'authenticated' ? (
            <EvaluationPage
              roundId={activeRoundId ?? null}
              currentPlayerId={
                authenticatedPlayer?.id ?? null
              }
              players={players}
              assignments={roundAssignments}
              isEvaluationOpen={isEvaluationOpen}
              isEvaluationClosed={isEvaluationClosed}
              isAdmin={currentPlayer?.role === 'admin'}
              evaluationStatusText={
                evaluationStatusText
              }
              onEvaluationClosed={
                handleEvaluationClosed
              }
            />
          ) : (
            <Navigate to="/entrar" replace />
          )
        }
      />

      <Route
        path="/historico"
        element={
          authStatus === 'authenticated' ? (
            <HistoryPage
              groupId={activeGroup?.id ?? null}
              groupName={
                activeGroup?.name ?? '10 e Faixa'
              }
            />
          ) : (
            <Navigate to="/entrar" replace />
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
