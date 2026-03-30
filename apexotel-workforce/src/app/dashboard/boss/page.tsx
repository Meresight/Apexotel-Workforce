'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Users, ClipboardCheck, AlertCircle, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Profile, TimeEntry } from '@/lib/types/database'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface EmployeeStatus extends Profile {
  active_entry?: TimeEntry
}

export default function BossDashboard() {
  const [employees, setEmployees] = useState<EmployeeStatus[]>([])
  const [stats, setStats] = useState({ clockedIn: 0, pendingLogs: 0, openTimecards: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRoster = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: bossProfile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()
    if (!bossProfile) return

    const { data: profiles } = await supabase.from('profiles').select('*').eq('company_id', bossProfile.company_id).eq('role', 'employee')
    const { data: activeEntries } = await supabase.from('time_entries').select('*').eq('status', 'open')
    const { count: pendingLogs } = await supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('status', 'submitted')
    const { count: openTimecards } = await supabase.from('timecards').select('*', { count: 'exact', head: true }).eq('status', 'pending')

    const roster = (profiles || []).map(p => ({ ...p, active_entry: activeEntries?.find(e => e.employee_id === p.id) }))
    setEmployees(roster)
    setStats({ clockedIn: activeEntries?.length || 0, pendingLogs: pendingLogs || 0, openTimecards: openTimecards || 0 })
    setLoading(false)
  }

  useEffect(() => {
    fetchRoster()
    const channel = supabase.channel('live-roster')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries' }, fetchRoster)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Live Roster</h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Real-time attendance monitoring</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, label: 'Clocked In', value: stats.clockedIn, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: ClipboardCheck, label: 'Pending Logs', value: stats.pendingLogs, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: AlertCircle, label: 'Timecards Due', value: stats.openTimecards, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Roster Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Team Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />)
          ) : employees.length > 0 ? employees.map(emp => {
            const isClockedIn = !!emp.active_entry
            return (
              <div key={emp.id} className={`bg-white border rounded-2xl p-5 transition-all hover:shadow-md ${isClockedIn ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={emp.avatar_url || ''} />
                    <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">
                      {emp.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{emp.full_name}</p>
                    <p className="text-xs text-slate-400">Employee</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isClockedIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isClockedIn ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                  </span>
                  {isClockedIn && emp.active_entry && (
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(parseISO(emp.active_entry.clock_in))}
                    </span>
                  )}
                </div>
              </div>
            )
          }) : (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-200 rounded-2xl">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No employees in your company yet.</p>
              <p className="text-xs text-slate-300 mt-1">Go to Employees to send an invite.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
