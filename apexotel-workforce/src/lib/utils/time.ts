import { format, differenceInMinutes, parseISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export function calculateDecimalHours(start: string, end: string): number {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  const diffInMins = differenceInMinutes(endDate, startDate)
  return Math.max(0, Number((diffInMins / 60).toFixed(2)))
}

export function getTodayDateString(timezone: string = 'UTC'): string {
  const now = new Date()
  const zonedDate = utcToZonedTime(now, timezone)
  return format(zonedDate, 'yyyy-MM-dd')
}

export function formatTime(dateStr: string, timezone: string = 'UTC'): string {
  const date = parseISO(dateStr)
  const zonedDate = utcToZonedTime(date, timezone)
  return format(zonedDate, 'h:mm a')
}
