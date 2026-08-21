import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'

type GroupRoundHistoryRow = {
  round_id: string
  scheduled_at: string
  round_status: string
  blue_score: number | null
  black_score: number | null
  evaluation_closed_at: string | null
}

type GroupEvaluationRankingRow = {
  player_id: string
  player_name: string
  average_rating: number | null
  ratings_count: number
  evaluated_rounds_count: number
}

type HistoryPageProps = {
  groupId: string | null
  groupName: string
}

function formatHistoryDate(value: string) {
  const formattedDate = new Intl.DateTimeFormat(
    'pt-BR',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  ).format(new Date(value))

  return (
    formattedDate.charAt(0).toUpperCase() +
    formattedDate.slice(1)
  )
}

function formatAverageRating(rating: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rating)
}

function getRoundResultText(
  blueScore: number,
  blackScore: number,
) {
  if (blueScore > blackScore) {
    return 'Vitória do Time Azul'
  }

  if (blackScore > blueScore) {
    return 'Vitória do Time Preto'
  }

  return 'Empate'
}

export function HistoryPage({
  groupId,
  groupName,
}: HistoryPageProps) {
  const [roundHistory, setRoundHistory] = useState<
    GroupRoundHistoryRow[]
  >([])

  const [isHistoryLoading, setIsHistoryLoading] =
    useState(false)

  const [historyError, setHistoryError] =
    useState<string | null>(null)

  const [ranking, setRanking] = useState<
    GroupEvaluationRankingRow[]
  >([])

  const [isRankingLoading, setIsRankingLoading] =
    useState(false)

  const [rankingError, setRankingError] =
    useState<string | null>(null)

  const sortedRoundHistory = [...roundHistory].sort(
    (firstRound, secondRound) =>
      new Date(secondRound.scheduled_at).getTime() -
      new Date(firstRound.scheduled_at).getTime(),
  )

  const classifiedPlayers = ranking
    .filter(
      (player) => player.average_rating !== null,
    )
    .sort((firstPlayer, secondPlayer) => {
      const averageDifference =
        Number(secondPlayer.average_rating) -
        Number(firstPlayer.average_rating)

      if (averageDifference !== 0) {
        return averageDifference
      }

      const ratingsCountDifference =
        Number(secondPlayer.ratings_count) -
        Number(firstPlayer.ratings_count)

      if (ratingsCountDifference !== 0) {
        return ratingsCountDifference
      }

      return firstPlayer.player_name.localeCompare(
        secondPlayer.player_name,
        'pt-BR',
        { sensitivity: 'base' },
      )
    })

  const playersWithInsufficientSample = ranking
    .filter(
      (player) => player.average_rating === null,
    )
    .sort((firstPlayer, secondPlayer) =>
      firstPlayer.player_name.localeCompare(
        secondPlayer.player_name,
        'pt-BR',
        { sensitivity: 'base' },
      ),
    )

  useEffect(() => {
    let ignoreResult = false

    async function loadRoundHistory() {
      setRoundHistory([])
      setHistoryError(null)

      if (!groupId) {
        setIsHistoryLoading(false)
        return
      }

      setIsHistoryLoading(true)

      const { data, error } = await supabase.rpc(
        'get_group_round_history',
        {
          target_group_id: groupId,
        },
      )

      if (ignoreResult) {
        return
      }

      setIsHistoryLoading(false)

      if (error) {
        console.error(
          'Erro ao carregar histórico de rodadas:',
          error,
        )
        setHistoryError(
          'Não foi possível carregar o histórico de rodadas.',
        )
        return
      }

      if (!Array.isArray(data)) {
        console.error(
          'Erro ao carregar histórico de rodadas:',
          new Error(
            'A função não retornou uma lista de rodadas.',
          ),
        )
        setHistoryError(
          'Não foi possível carregar o histórico de rodadas.',
        )
        return
      }

      setRoundHistory(data as GroupRoundHistoryRow[])
    }

    void loadRoundHistory()

    return () => {
      ignoreResult = true
    }
  }, [groupId])

  useEffect(() => {
    let ignoreResult = false

    async function loadEvaluationRanking() {
      setRanking([])
      setRankingError(null)

      if (!groupId) {
        setIsRankingLoading(false)
        return
      }

      setIsRankingLoading(true)

      const { data, error } = await supabase.rpc(
        'get_group_evaluation_ranking',
        {
          target_group_id: groupId,
        },
      )

      if (ignoreResult) {
        return
      }

      setIsRankingLoading(false)

      if (error) {
        console.error(
          'Erro ao carregar ranking de avaliações:',
          error,
        )
        setRankingError(
          'Não foi possível carregar o ranking de avaliações.',
        )
        return
      }

      if (!Array.isArray(data)) {
        console.error(
          'Erro ao carregar ranking de avaliações:',
          new Error(
            'A função não retornou uma lista de jogadores.',
          ),
        )
        setRankingError(
          'Não foi possível carregar o ranking de avaliações.',
        )
        return
      }

      setRanking(data as GroupEvaluationRankingRow[])
    }

    void loadEvaluationRanking()

    return () => {
      ignoreResult = true
    }
  }, [groupId])

  return (
    <section className="history-page">
      <Link className="back-link" to="/jogos">
        ← Voltar para Jogos
      </Link>

      <div className="page-heading">
        <p className="eyebrow">{groupName}</p>
        <h1>Histórico e ranking</h1>
        <p>
          Consulte os resultados anteriores e as médias
          agregadas dos jogadores.
        </p>
      </div>

      {!groupId && (
        <section className="history-empty-state">
          <h2>Grupo indisponível</h2>
          <p>
            Não foi possível identificar o grupo ativo.
          </p>
        </section>
      )}

      {groupId && (
        <>
          <section className="history-section">
            <div className="history-section-heading">
              <p className="eyebrow">Partidas</p>
              <h2>Histórico de rodadas</h2>
            </div>

            {isHistoryLoading && (
              <p className="history-state-message">
                Carregando histórico...
              </p>
            )}

            {historyError && (
              <p
                className="history-feedback history-feedback--error"
                role="status"
              >
                {historyError}
              </p>
            )}

            {!isHistoryLoading &&
              !historyError &&
              sortedRoundHistory.length === 0 && (
                <div className="history-empty-state">
                  <h3>Nenhuma rodada encontrada</h3>
                  <p>
                    Os resultados anteriores aparecerão
                    aqui.
                  </p>
                </div>
              )}

            {!isHistoryLoading &&
              !historyError &&
              sortedRoundHistory.length > 0 && (
                <div className="round-history-list">
                  {sortedRoundHistory.map((round) => {
                    const hasResult =
                      round.blue_score !== null &&
                      round.black_score !== null

                    return (
                      <article
                        className="round-history-card"
                        key={round.round_id}
                      >
                        <h3>
                          {formatHistoryDate(
                            round.scheduled_at,
                          )}
                        </h3>

                        <div className="round-history-score">
                          <div>
                            <span>Time Azul</span>
                            <strong>
                              {round.blue_score ?? '—'}
                            </strong>
                          </div>

                          <span aria-hidden="true">×</span>

                          <div>
                            <span>Time Preto</span>
                            <strong>
                              {round.black_score ?? '—'}
                            </strong>
                          </div>
                        </div>

                        <p className="round-history-result">
                          {hasResult
                            ? getRoundResultText(
                                round.blue_score as number,
                                round.black_score as number,
                              )
                            : 'Resultado não registrado'}
                        </p>
                      </article>
                    )
                  })}
                </div>
              )}
          </section>

          <section className="history-section ranking-section">
            <div className="history-section-heading">
              <p className="eyebrow">Avaliações</p>
              <h2>Ranking de avaliações</h2>
            </div>

            {isRankingLoading && (
              <p className="history-state-message">
                Carregando ranking...
              </p>
            )}

            {rankingError && (
              <p
                className="history-feedback history-feedback--error"
                role="status"
              >
                {rankingError}
              </p>
            )}

            {!isRankingLoading &&
              !rankingError &&
              ranking.length === 0 && (
                <div className="history-empty-state">
                  <h3>Ranking ainda indisponível</h3>
                  <p>
                    As médias aparecerão após avaliações
                    suficientes em rodadas encerradas.
                  </p>
                </div>
              )}

            {!isRankingLoading &&
              !rankingError &&
              ranking.length > 0 && (
                <>
                  {classifiedPlayers.length > 0 ? (
                    <ol className="evaluation-ranking-list">
                      {classifiedPlayers.map(
                        (player, index) => (
                          <li
                            className="evaluation-ranking-player"
                            key={player.player_id}
                          >
                            <span className="evaluation-ranking-position">
                              {index + 1}
                            </span>

                            <div className="evaluation-ranking-player__identity">
                              <strong>
                                {player.player_name}
                              </strong>
                              <span>
                                {player.ratings_count}{' '}
                                {player.ratings_count === 1
                                  ? 'avaliação'
                                  : 'avaliações'}
                                {' · '}
                                {player.evaluated_rounds_count}{' '}
                                {player.evaluated_rounds_count ===
                                1
                                  ? 'rodada'
                                  : 'rodadas'}
                              </span>
                            </div>

                            <strong className="evaluation-ranking-average">
                              {formatAverageRating(
                                Number(
                                  player.average_rating,
                                ),
                              )}
                            </strong>
                          </li>
                        ),
                      )}
                    </ol>
                  ) : (
                    <p className="history-state-message">
                      Nenhum jogador atingiu a amostra
                      mínima para entrar no ranking.
                    </p>
                  )}

                  {playersWithInsufficientSample.length >
                    0 && (
                    <div className="insufficient-sample-section">
                      <h3>Amostra insuficiente</h3>
                      <ul>
                        {playersWithInsufficientSample.map(
                          (player) => (
                            <li key={player.player_id}>
                              <strong>
                                {player.player_name}
                              </strong>
                              <span>
                                {player.ratings_count}{' '}
                                {player.ratings_count === 1
                                  ? 'avaliação recebida'
                                  : 'avaliações recebidas'}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
          </section>
        </>
      )}
    </section>
  )
}
