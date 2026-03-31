'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, MapPin, Play, Square, Timer, Activity } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { TimeEntry } from '@/lib/types/database'
import { cn } from '@/lib/utils'

export default function ClockWidget() {
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState<string>('00 : 00')
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
      const seconds = Math.floor((diff / 1000) % 60)
      setElapsed(`${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`)
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

    try {
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
    } catch (err) {
      console.error(err)
      alert('Network error or server unreachable')
    }
    setLoading(false)
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clock/out', {
        method: 'PATCH'
      })

      if (res.ok) {
        setActiveEntry(null)
        setElapsed('00 : 00')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to clock out')
      }
    } catch (err) {
      console.error(err)
      alert('Network error or server unreachable')
    }
    setLoading(false)
  }

  if (loading && !activeEntry) {
    return (
      <div className="w-full h-[320px] bg-white border border-slate-200 rounded-[2.5rem] animate-pulse" />
    )
  }

  return (
    <div className={cn(
      "group relative w-full bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 transition-all duration-500 overflow-hidden",
      activeEntry ? "border-emerald-500/20 ring-4 ring-emerald-500/5 shadow-emerald-500/10" : "hover:border-blue-500/10"
    )}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
         <Timer className="w-48 h-48 text-slate-900" />
      </div>

      <div className="flex items-center gap-4 mb-10">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
          activeEntry ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white shadow-blue-500/20"
        )}>
          {activeEntry ? <Activity className="w-6 h-6 animate-pulse" /> : <Clock className="w-6 h-6" />}
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-black text-slate-950 tracking-tight leading-none">Shift Core</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 pl-0.5">Real-time Tracker</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6 mb-8 relative z-10">
        <div className={cn(
          "text-5xl font-black tracking-tighter mb-2 tabular-nums transition-colors duration-500",
          activeEntry ? "text-emerald-600 drop-shadow-sm" : "text-slate-300"
        )}>
          {elapsed}
        </div>
        {activeEntry ? (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full animate-in fade-in slide-in-from-bottom-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest pt-0.5">
              Active since {new Date(activeEntry.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : (
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 pl-1 italic">
             No active session
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 relative z-10">
        {!activeEntry ? (
          <button 
            onClick={handleClockIn} 
            disabled={loading}
            className="group/btn relative w-full h-16 bg-[#020617] hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden shadow-xl shadow-slate-200"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-3">
              <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
              Begin Shift
            </span>
          </button>
        ) : (
          <button 
            onClick={handleClockOut} 
            disabled={loading}
            className="group/btn relative w-full h-16 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden shadow-xl shadow-rose-200"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-3">
              <Square className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
              End Session
            </span>
          </button>
        )}
      </div>

      {activeEntry?.location && (
        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 group/loc">
          <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center transition-colors group-hover/loc:bg-blue-50">
            <MapPin className="w-3 h-3 text-slate-400 group-hover/loc:text-blue-500 transition-colors" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">Location verified</span>
        </div>
      )}
    </div>
  )
}
