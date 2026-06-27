export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60_000)
}

export function secondsFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

export function minutesUntil(date: Date, now = new Date()): number {
  return Math.max(1, Math.ceil((date.getTime() - now.getTime()) / 60_000))
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
