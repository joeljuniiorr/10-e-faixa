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

export type ConfirmationWindowStatus =
  | 'not-started'
  | 'open'
  | 'closed'

export function getConfirmationWindow(
  roundDate: Date,
  referenceDate = new Date(),
) {
  const opensAt = new Date(roundDate)
  opensAt.setDate(roundDate.getDate() - 6)
  opensAt.setHours(21, 0, 0, 0)

  const closesAt = new Date(roundDate)
  closesAt.setHours(16, 0, 0, 0)

  let status: ConfirmationWindowStatus = 'open'

  if (referenceDate < opensAt) {
    status = 'not-started'
  }

  if (referenceDate >= closesAt) {
  status = 'closed'
}

  return {
    opensAt,
    closesAt,
    status,
    isOpen: status === 'open',
  }
}

export function getResultsWindow(
  roundDate: Date,
  referenceDate = new Date(),
) {
  const opensAt = new Date(roundDate)
  opensAt.setHours(21, 0, 0, 0)

  return {
    opensAt,
    isOpen: referenceDate >= opensAt,
  }
}