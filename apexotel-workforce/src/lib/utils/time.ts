import { format, differenceInMinutes, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

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
  const zonedDate = toZonedTime(now, timezone)
  return format(zonedDate, 'yyyy-MM-dd')
}

export function formatTime(dateStr: string, timezone: string = 'UTC'): string {
  const date = parseISO(dateStr)
  const zonedDate = toZonedTime(date, timezone)
  return format(zonedDate, 'h:mm a')
}

/**
 * Calculates hours between two times (HH:mm) and subtracts 1 hour for break.
 * Returns 0 if calculation is negative or invalid.
 */
export function calculateAdjustedHours(adjustIn: string | null, adjustOut: string | null): number {
  if (!adjustIn || !adjustOut) return 0
  
  try {
    const [inH, inM] = adjustIn.split(':').map(Number)
    const [outH, outM] = adjustOut.split(':').map(Number)
    
    if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return 0
    
    const inTotalMins = inH * 60 + inM
    const outTotalMins = outH * 60 + outM
    
    const diffMins = outTotalMins - inTotalMins
    if (diffMins <= 0) return 0
    
    // Total hours - 1 hour lunch break
    const hours = (diffMins / 60) - 1
    return Math.max(0, Number(hours.toFixed(2)))
  } catch (err) {
    return 0
  }
}
