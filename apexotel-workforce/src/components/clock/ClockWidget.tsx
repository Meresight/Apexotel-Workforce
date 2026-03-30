'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, MapPin, Play, Square } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { TimeEntry } from '@/lib/types/database'

export default function ClockWidget() {
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState<string>('0h 0m')
  const supabase = createClient()

  const fetchActiveEntry = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('employee_id', user.id)
      .eq('status', 'open')
      .maybeSingle()

    setActiveEntry(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchActiveEntry()
  }, [])

  useEffect(() => {
    if (!activeEntry) return

    const interval = setInterval(() => {
      const start = parseISO(activeEntry.clock_in)
      const diff = new Date().getTime() - start.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      setElapsed(`${hours}h ${minutes}m`)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeEntry])

  const handleClockIn = async () => {
    setLoading(true)
    let location = null

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        location = JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      } catch (err) {
        console.error("Location access denied")
      }
    }

    const res = await fetch('/api/clock/in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    })

    if (res.ok) {
      await fetchActiveEntry()
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to clock in')
    }
    setLoading(false)
  }

  const handleClockOut = async () => {
    setLoading(true)
    const res = await fetch('/api/clock/out', {
      method: 'PATCH'
    })

    if (res.ok) {
      setActiveEntry(null)
      setElapsed('0h 0m')
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to clock out')
    }
    setLoading(false)
  }

  if (loading && !activeEntry) {
    return (
      <Card className="w-full animate-pulse bg-slate-100 h-48 border-none" />
    )
  }

  return (
    <Card className={`w-full border-2 transition-all duration-300 ${activeEntry ? 'border-green-500 bg-green-50/30' : 'border-slate-200 bg-white'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-bold text-slate-800">
          <Clock className="w-5 h-5 mr-2" />
          Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-4">
          {activeEntry ? (
            <>
              <div className="text-4xl font-extrabold text-green-600 mb-1 tracking-tighter">
                {elapsed}
              </div>
              <p className="text-sm text-green-700 font-medium">
                Clocked in since {new Date(activeEntry.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl font-extrabold text-slate-300 mb-1 tracking-tighter">
                0h 0m
              </div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                Ready to work?
              </p>
            </>
          )}
        </div>

        <div className="flex gap-4">
          {!activeEntry ? (
            <Button 
              onClick={handleClockIn} 
              disabled={loading}
              className="flex-1 h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Clock In
            </Button>
          ) : (
            <Button 
              onClick={handleClockOut} 
              disabled={loading}
              variant="destructive"
              className="flex-1 h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Square className="w-5 h-5 mr-2 fill-current" />
              Clock Out
            </Button>
          )}
        </div>

        {activeEntry?.location && (
          <div className="pt-2 flex items-center justify-center text-xs text-slate-500 font-medium italic">
            <MapPin className="w-3 h-3 mr-1" />
            Location captured on clock-in
          </div>
        )}
      </CardContent>
    </Card>
  )
}
