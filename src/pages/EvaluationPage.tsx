import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Player } from '../data/players'
import type { RoundPlayerAssignment } from '../data/round'
import { supabase } from '../lib/supabase'

type RoundEvaluationRow = {
  evaluated_player_id: string
  rating: number
}

type RoundEvaluationSummaryRow = {
  evaluated_player_id: string
  average_rating: number | null
  ratings_count: number
}

type EvaluationFeedback = {
  kind: 'success' | 'error'
  message: string
}

type EvaluationPageProps = {
  roundId: string | null
  currentPlayerId: string | null
  players: Player[]
  assignments: RoundPlayerAssignment[]
  isEvaluationOpen: boolean
  isEvaluationClosed: boolean
  isAdmin: boolean
  evaluationStatusText: string
  onEvaluationClosed: (
    roundId: string,
    closedAt: string,
  ) => void
}

const ratingOptions = Array.from(
  { length: 21 },
  (_, index) => index / 2,
)

function formatRating(rating: number) {
  if (rating === 0) {
    return '0'
  }

  return rating.toFixed(1).replace('.', ',')
}

function formatAverageRating(rating: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rating)
}

export function EvaluationPage({
  roundId,
  currentPlayerId,
  players,
  assignments,
  isEvaluationOpen,
  isEvaluationClosed,
  isAdmin,
  evaluationStatusText,
  onEvaluationClosed,
}: EvaluationPageProps) {
  const [ratings, setRatings] = useState<
    Record<string, number>
  >({})

  const [isLoading, setIsLoading] =
    useState(false)

  const [isSaving, setIsSaving] =
    useState(false)

  const [isClosing, setIsClosing] =
    useState(false)

  const [evaluationSummary, setEvaluationSummary] =
    useState<RoundEvaluationSummaryRow[]>([])

  const [isLoadingSummary, setIsLoadingSummary] =
    useState(false)

  const [summaryError, setSummaryError] =
    useState<string | null>(null)

  const [feedback, setFeedback] =
    useState<EvaluationFeedback | null>(null)

  const participantIds = new Set(
    assignments.map(
      (assignment) => assignment.playerId,
    ),
  )

  const isCurrentPlayerParticipant = Boolean(
    currentPlayerId &&
      participantIds.has(currentPlayerId),
  )

  const participantPlayers = players.filter((player) =>
    participantIds.has(player.id),
  )

  const evaluablePlayers = participantPlayers.filter(
    (player) => player.id !== currentPlayerId,
  )

  const summaryByPlayerId = new Map(
    evaluationSummary.map((summary) => [
      summary.evaluated_player_id,
      summary,
    ]),
  )

  const selectedRatingsCount =
    evaluablePlayers.filter(
      (player) => ratings[player.id] !== undefined,
    ).length

  useEffect(() => {
    let ignoreResult = false

    async function loadEvaluations() {
      setRatings({})
      setFeedback(null)

      if (!roundId || !currentPlayerId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await supabase
        .from('round_evaluations')
        .select('evaluated_player_id, rating')
        .eq('round_id', roundId)
        .eq('evaluator_id', currentPlayerId)
        .overrideTypes<
          RoundEvaluationRow[],
          { merge: false }
        >()

      if (ignoreResult) {
        return
      }

      setIsLoading(false)

      if (error) {
        console.error(
          'Erro ao carregar avaliações da rodada:',
          error,
        )
        setFeedback({
          kind: 'error',
          message:
            'Não foi possível carregar suas avaliações.',
        })
        return
      }

      setRatings(
        Object.fromEntries(
          data.map((evaluation) => [
            evaluation.evaluated_player_id,
            evaluation.rating,
          ]),
        ),
      )
    }

    void loadEvaluations()

    return () => {
      ignoreResult = true
    }
  }, [currentPlayerId, roundId])

  useEffect(() => {
    let ignoreResult = false

    async function loadEvaluationSummary() {
      setEvaluationSummary([])
      setSummaryError(null)

      if (!roundId || !isEvaluationClosed) {
        setIsLoadingSummary(false)
        return
      }

      setIsLoadingSummary(true)

      const { data, error } = await supabase
        .rpc('get_round_evaluation_summary', {
          target_round_id: roundId,
        })

      if (ignoreResult) {
        return
      }

      setIsLoadingSummary(false)

      if (error) {
        console.error(
          'Erro ao carregar médias das avaliações:',
          error,
        )
        setSummaryError(
          'Não foi possível carregar o resultado das avaliações.',
        )
        return
      }

      if (!Array.isArray(data)) {
        console.error(
          'Erro ao carregar médias das avaliações:',
          new Error(
            'A função não retornou uma lista de médias.',
          ),
        )
        setSummaryError(
          'Não foi possível carregar o resultado das avaliações.',
        )
        return
      }

      setEvaluationSummary(
        data as RoundEvaluationSummaryRow[],
      )
    }

    void loadEvaluationSummary()

    return () => {
      ignoreResult = true
    }
  }, [isEvaluationClosed, roundId])

  function handleRatingChange(
    playerId: string,
    rating: number,
  ) {
    setRatings((currentRatings) => ({
      ...currentRatings,
      [playerId]: rating,
    }))
    setFeedback(null)
  }

  async function handleSaveEvaluations() {
    if (
      !isEvaluationOpen ||
      !isCurrentPlayerParticipant ||
      !roundId ||
      !currentPlayerId ||
      isSaving
    ) {
      return
    }

    const evaluationsToSave = evaluablePlayers.flatMap(
      (player) => {
        const rating = ratings[player.id]

        if (rating === undefined) {
          return []
        }

        return [
          {
            round_id: roundId,
            evaluator_id: currentPlayerId,
            evaluated_player_id: player.id,
            rating,
            updated_at: new Date().toISOString(),
          },
        ]
      },
    )

    if (evaluationsToSave.length === 0) {
      setFeedback({
        kind: 'error',
        message: 'Selecione ao menos uma nota para salvar.',
      })
      return
    }

    setIsSaving(true)
    setFeedback(null)

    const { error } = await supabase
      .from('round_evaluations')
      .upsert(evaluationsToSave, {
        onConflict:
          'round_id,evaluator_id,evaluated_player_id',
      })

    setIsSaving(false)

    if (error) {
      console.error(
        'Erro ao salvar avaliações da rodada:',
        error,
      )
      setFeedback({
        kind: 'error',
        message:
          'Não foi possível salvar as avaliações. Tente novamente.',
      })
      return
    }

    setFeedback({
      kind: 'success',
      message: 'Avaliações salvas com sucesso.',
    })
  }

  async function handleCloseEvaluation() {
    if (
      !isEvaluationOpen ||
      !isAdmin ||
      !roundId ||
      isClosing
    ) {
      return
    }

    const confirmed = window.confirm(
      'Encerrar as avaliações agora? Esta ação não poderá ser desfeita.',
    )

    if (!confirmed) {
      return
    }

    setIsClosing(true)
    setFeedback(null)

    const { data, error } = await supabase
      .rpc('close_round_evaluation', {
        target_round_id: roundId,
      })

    setIsClosing(false)

    if (error || typeof data !== 'string') {
      console.error(
        'Erro ao encerrar avaliações da rodada:',
        error ??
          new Error(
            'A função não retornou o horário de fechamento.',
          ),
      )
      setFeedback({
        kind: 'error',
        message:
          'Não foi possível encerrar as avaliações. Tente novamente.',
      })
      return
    }

    onEvaluationClosed(roundId, data)
    setFeedback({
      kind: 'success',
      message: 'Avaliações encerradas com sucesso.',
    })
  }

  return (
    <section className="evaluation-page">
      <Link className="back-link" to="/jogos">
        ← Voltar para Jogos
      </Link>

      <div className="page-heading">
        <p className="eyebrow">Rodada atual</p>
        <h1>Avaliações</h1>
        <p>
          Avalie os jogadores que participaram da
          rodada com você.
        </p>
      </div>

      <section
        className={`evaluation-status-card ${
          isEvaluationOpen
            ? 'evaluation-status-card--open'
            : 'evaluation-status-card--closed'
        }`}
      >
        <strong>
          {isEvaluationOpen
            ? 'Avaliações abertas'
            : 'Avaliações indisponíveis'}
        </strong>
        <p>{evaluationStatusText}</p>
      </section>

      {isEvaluationOpen && isAdmin && roundId && (
        <section className="evaluation-admin-card">
          <div>
            <p className="eyebrow">Administração</p>
            <h2>Encerramento antecipado</h2>
            <p>
              Encerre a coleta e libere as médias
              agregadas. Esta ação não poderá ser
              desfeita.
            </p>
          </div>

          <button
            className="evaluation-close-button"
            type="button"
            disabled={isClosing}
            onClick={() => {
              void handleCloseEvaluation()
            }}
          >
            {isClosing
              ? 'Encerrando...'
              : 'Encerrar avaliações'}
          </button>
        </section>
      )}

      {!roundId && (
        <section className="evaluation-empty-state">
          <h2>Nenhuma rodada ativa</h2>
          <p>
            As avaliações aparecerão quando houver uma
            rodada disponível.
          </p>
        </section>
      )}

      {roundId && isLoading && (
        <section className="evaluation-empty-state">
          <p>Carregando suas avaliações...</p>
        </section>
      )}

      {roundId &&
        !isLoading &&
        assignments.length === 0 && (
          <section className="evaluation-empty-state">
            <h2>Participantes indisponíveis</h2>
            <p>
              A formação desta rodada ainda não possui
              jogadores para avaliação.
            </p>
          </section>
        )}

      {roundId &&
        !isLoading &&
        assignments.length > 0 &&
        !isCurrentPlayerParticipant && (
          <section className="evaluation-empty-state">
            <h2>Você não participou desta rodada</h2>
            <p>
              Somente jogadores presentes na formação
              podem realizar avaliações.
            </p>
          </section>
        )}

      {roundId &&
        !isLoading &&
        isCurrentPlayerParticipant && (
          <>
            <div className="evaluation-list-heading">
              <div>
                <p className="eyebrow">Participantes</p>
                <h2>Notas dos jogadores</h2>
              </div>
              <span>
                {selectedRatingsCount} de{' '}
                {evaluablePlayers.length}
              </span>
            </div>

            <div className="evaluation-list">
              {evaluablePlayers.map((player) => {
                const selectId =
                  `evaluation-rating-${player.id}`

                return (
                  <div
                    className="evaluation-player-card"
                    key={player.id}
                  >
                    <label htmlFor={selectId}>
                      <span className="player-avatar">
                        {player.name.charAt(0)}
                      </span>
                      <strong>{player.name}</strong>
                    </label>

                    <select
                      id={selectId}
                      value={ratings[player.id] ?? ''}
                      disabled={
                        !isEvaluationOpen || isSaving
                      }
                      onChange={(event) =>
                        handleRatingChange(
                          player.id,
                          Number(event.target.value),
                        )
                      }
                    >
                      <option value="" disabled>
                        Selecionar nota
                      </option>
                      {ratingOptions.map((rating) => (
                        <option key={rating} value={rating}>
                          {formatRating(rating)}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>

            {isEvaluationOpen && (
              <button
                className="primary-action-button evaluation-save-button"
                type="button"
                disabled={
                  isSaving || selectedRatingsCount === 0
                }
                onClick={() => {
                  void handleSaveEvaluations()
                }}
              >
                {isSaving
                  ? 'Salvando...'
                  : 'Salvar avaliações'}
              </button>
            )}

          </>
        )}

      {feedback && (
        <p
          className={`evaluation-feedback evaluation-feedback--${feedback.kind}`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      )}

      {roundId && isEvaluationClosed && (
        <section className="evaluation-summary-section">
          <div className="evaluation-summary-heading">
            <p className="eyebrow">Médias agregadas</p>
            <h2>Resultado das avaliações</h2>
            <p>
              Os votos individuais permanecem privados.
            </p>
          </div>

          {isLoadingSummary && (
            <p className="evaluation-summary-message">
              Carregando resultado das avaliações...
            </p>
          )}

          {summaryError && (
            <p
              className="evaluation-feedback evaluation-feedback--error"
              role="status"
            >
              {summaryError}
            </p>
          )}

          {!isLoadingSummary && !summaryError && (
            <div className="evaluation-summary-list">
              {participantPlayers.map((player) => {
                const summary =
                  summaryByPlayerId.get(player.id)

                return (
                  <article
                    className="evaluation-summary-player"
                    key={player.id}
                  >
                    <div className="evaluation-summary-player__identity">
                      <span className="player-avatar">
                        {player.name.charAt(0)}
                      </span>
                      <strong>{player.name}</strong>
                    </div>

                    {!summary && (
                      <p>Nenhuma avaliação recebida</p>
                    )}

                    {summary &&
                      summary.average_rating === null && (
                        <div className="evaluation-summary-player__result">
                          <strong>Média indisponível</strong>
                          <span>
                            Amostra insuficiente ·{' '}
                            {summary.ratings_count}{' '}
                            {summary.ratings_count === 1
                              ? 'avaliação'
                              : 'avaliações'}
                          </span>
                        </div>
                      )}

                    {summary &&
                      summary.average_rating !== null && (
                        <div className="evaluation-summary-player__result">
                          <strong>
                            {formatAverageRating(
                              summary.average_rating,
                            )}
                          </strong>
                          <span>
                            {summary.ratings_count}{' '}
                            {summary.ratings_count === 1
                              ? 'avaliação'
                              : 'avaliações'}
                          </span>
                        </div>
                      )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}
    </section>
  )
}
