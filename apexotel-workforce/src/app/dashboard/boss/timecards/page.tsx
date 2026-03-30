'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TimecardTable from '@/components/timecards/TimecardTable'
import TimecardApproval from '@/components/timecards/TimecardApproval'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Filter, User } from 'lucide-react'
import type { TimeEntry, Profile } from '@/lib/types/database'
import { startOfWeek, endOfWeek, format, startOfDay, endOfDay } from 'date-fns'

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
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between space-y-6 md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <FileText className="w-8 h-8 mr-4 text-slate-400" />
            Timecard Review
          </h2>
          <p className="text-slate-500 font-medium italic">Audit hours and approve payroll cycles.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-xl">
           <div className="flex items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <User className="w-4 h-4 mr-3 text-slate-400" />
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-44 border-none bg-transparent font-bold h-8 text-xs focus:ring-0">
                  <SelectValue placeholder="Member" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-2xl shadow-2xl">
                   {employees.map(emp => (
                     <SelectItem key={emp.id} value={emp.id} className="font-bold">{emp.full_name}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
           </div>
           
           <div className="flex items-center space-x-2 px-4 py-2">
              <Filter className="w-4 h-4 text-slate-300 mr-2" />
              <Input 
                type="date" 
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-36 h-8 text-xs font-bold border-none bg-slate-50 rounded-xl"
              />
              <span className="text-slate-300 font-bold">to</span>
              <Input 
                type="date" 
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-36 h-8 text-xs font-bold border-none bg-slate-50 rounded-xl"
              />
           </div>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
           <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-12">
           <TimecardTable entries={entries} />
           
           {entries.length > 0 && (
             <TimecardApproval 
               employeeId={selectedEmployeeId}
               employeeName={selectedEmployeeName}
               periodStart={periodStart}
               periodEnd={periodEnd}
               onApproved={fetchEntries}
             />
           )}
        </div>
      )}
    </div>
  )
}
