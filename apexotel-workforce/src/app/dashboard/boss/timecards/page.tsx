'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TimecardTable from '@/components/timecards/TimecardTable'
import TimecardApproval from '@/components/timecards/TimecardApproval'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Filter, User, Calendar, ShieldCheck, Clock, Search, ChevronRight } from 'lucide-react'
import type { TimeEntry, Profile } from '@/lib/types/database'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function BossTimecardsPage() {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [periodStart, setPeriodStart] = useState<string>(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'))
  const [periodEnd, setPeriodEnd] = useState<string>(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'))
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const fetchEmployees = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profile) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('role', 'employee')
        .order('full_name')
      setEmployees(data || [])
      if (data && data.length > 0) setSelectedEmployeeId(data[0].id)
    }
  }

  const fetchEntries = async () => {
    if (!selectedEmployeeId) return
    setLoading(true)
    
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('employee_id', selectedEmployeeId)
      .gte('work_date', periodStart)
      .lte('work_date', periodEnd)
      .order('work_date', { ascending: true })
    
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [selectedEmployeeId, periodStart, periodEnd])

  const selectedEmployeeName = employees.find(e => e.id === selectedEmployeeId)?.full_name || ''

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Premium Header */}
      <div className="bg-[#020617] rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <ShieldCheck className="w-64 h-64 -translate-y-10 translate-x-10 text-blue-400" />
         </div>
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FileText className="w-7 h-7 text-white" />
                 </div>
                 <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Audit Command</h1>
              </div>
              <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px] pl-1">
                 Payroll Integrity & Timecard Verification
              </p>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[2rem] backdrop-blur-xl">
               <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl">
                  <User className="w-4 h-4 text-blue-400" />
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger className="w-44 border-none bg-transparent font-black text-[10px] uppercase tracking-widest text-white h-8 focus:ring-0">
                      <SelectValue placeholder="Target Personnel" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-2xl shadow-2xl border-slate-200">
                       {employees.map(emp => (
                         <SelectItem key={emp.id} value={emp.id} className="font-bold text-xs py-3">{emp.full_name}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
               </div>
               
               <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

               <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="bg-white/10 border-none rounded-lg p-2 text-[10px] font-black text-white uppercase tracking-widest focus:ring-0"
                    />
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <input 
                      type="date" 
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="bg-white/10 border-none rounded-lg p-2 text-[10px] font-black text-white uppercase tracking-widest focus:ring-0"
                    />
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Main Audit View */}
      {loading ? (
        <div className="space-y-6">
           <Skeleton className="h-[600px] w-full rounded-[2.5rem] bg-slate-50" />
        </div>
      ) : (
        <div className="space-y-12">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-10 px-2">
                   <Clock className="w-5 h-5 text-blue-600" />
                   <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 pt-0.5">Time Log Registry</h3>
                   <div className="h-px flex-1 bg-slate-100 ml-4" />
                </div>
                
                <TimecardTable 
                  employeeId={selectedEmployeeId} 
                  entries={entries} 
                  onUpdate={fetchEntries}
                />
            </div>
            
            {entries.length > 0 && (
              <div className="animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
                <TimecardApproval 
                  employeeId={selectedEmployeeId}
                  employeeName={selectedEmployeeName}
                  periodStart={periodStart}
                  periodEnd={periodEnd}
                  onApproved={fetchEntries}
                />
              </div>
            )}
        </div>
      )}
    </div>
  )
}
