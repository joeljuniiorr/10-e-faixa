const monday = 1

export function getNextRoundDate(
  referenceDate = new Date(),
) {
  const roundDate = new Date(referenceDate)

  const daysUntilMonday =
    (monday - referenceDate.getDay() + 7) % 7

  roundDate.setDate(
    referenceDate.getDate() + daysUntilMonday,
  )

  roundDate.setHours(20, 0, 0, 0)

  return roundDate
}

export function formatRoundDate(date: Date) {
  const formattedDate = new Intl.DateTimeFormat(
    'pt-BR',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    },
  ).format(date)

  return (
    formattedDate.charAt(0).toUpperCase() +
    formattedDate.slice(1)
  )
}