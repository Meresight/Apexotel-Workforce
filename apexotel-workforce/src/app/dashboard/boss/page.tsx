'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Users, ClipboardCheck, AlertCircle, Circle, Zap, ArrowUpRight, TrendingUp, Search, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Profile, TimeEntry } from '@/lib/types/database'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 selection:bg-blue-100">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">Live Roster</h1>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">Global Sync</span>
            </div>
          </div>
          <p className="text-slate-500 font-medium pl-1">Monitoring workforce presence in real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex items-center shadow-sm">
            <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Day</button>
            <button className="px-4 py-2 text-xs font-bold bg-[#020617] text-white rounded-xl shadow-lg uppercase tracking-widest">Active</button>
            <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">All</button>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Clock, label: 'Clocked In', value: stats.clockedIn, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', border: 'hover:border-blue-500/30' },
          { icon: ClipboardCheck, label: 'Pending Logs', value: stats.pendingLogs, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Critical', border: 'hover:border-amber-500/30' },
          { icon: AlertCircle, label: 'Timecards Due', value: stats.openTimecards, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Urgent', border: 'hover:border-rose-500/30' },
        ].map(s => (
          <div key={s.label} className={cn(
            "group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 overflow-hidden",
            s.border
          )}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
               <s.icon className="w-32 h-32 text-slate-900" />
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <div className={cn(s.bg, "w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform")}>
                <s.icon className={cn("w-6 h-6", s.color)} />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">
                <TrendingUp className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.trend}</span>
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <p className="text-4xl font-black text-slate-950 tracking-tight">{s.value}</p>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Management Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Roster</h2>
           <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-slate-900 transition-colors"><Search className="w-4 h-4" /></button>
              <button className="text-slate-400 hover:text-slate-900 transition-colors"><Filter className="w-4 h-4" /></button>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse border border-slate-200" />
            ))
          ) : employees.length > 0 ? employees.map(emp => {
            const isClockedIn = !!emp.active_entry
            return (
              <div 
                key={emp.id} 
                className={cn(
                  "group relative bg-white border border-slate-200 rounded-[2.5rem] p-6 transition-all hover:shadow-2xl hover:shadow-slate-200/50",
                  isClockedIn ? "border-emerald-500/20 ring-4 ring-emerald-500/5" : "hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-xl">
                      <AvatarImage src={emp.avatar_url || ''} className="object-cover" />
                      <AvatarFallback className="bg-[#020617] text-white text-xs font-black">
                        {emp.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full shadow-lg",
                      isClockedIn ? "bg-emerald-500" : "bg-slate-300"
                    )} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-950 text-sm truncate tracking-tight">{emp.full_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Staff Associate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    isClockedIn ? "bg-emerald-50 border-emerald-100/50" : "bg-slate-50 border-slate-100"
                  )}>
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isClockedIn ? "text-emerald-700" : "text-slate-500"
                      )}>
                        {isClockedIn ? 'Active Session' : 'Offline'}
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {isClockedIn ? 'Working Now' : 'Shift Ended'}
                      </p>
                    </div>
                    {isClockedIn && emp.active_entry && (
                      <div className="w-8 h-8 rounded-full bg-white border border-emerald-100 flex items-center justify-center animate-pulse">
                         <Clock className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                  </div>

                  {isClockedIn && emp.active_entry && (
                    <div className="flex items-center justify-between px-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                       <span className="text-xs font-black text-slate-900">
                          {formatDistanceToNow(parseISO(emp.active_entry.clock_in))}
                       </span>
                    </div>
                  )}
                </div>

                <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-50 rounded-xl">
                   <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )
          }) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                <Users className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-950 tracking-tight">No staff members detected</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2 mb-8">Your enterprise roster is currently empty. Invite employees using your legacy company ID.</p>
              <button className="bg-[#020617] text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200">
                 Invite Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
