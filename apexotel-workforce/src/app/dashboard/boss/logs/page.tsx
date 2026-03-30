'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LogReviewCard from '@/components/logs/LogReviewCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardList, Filter, Search } from 'lucide-react'
import type { DailyLog, Profile } from '@/lib/types/database'

export default function AllLogsPage() {
  const [logs, setLogs] = useState<(DailyLog & { profiles: Profile })[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('')
  
  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: bossProfile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!bossProfile) return

    // Fetch employees for filter
    const { data: emps } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', bossProfile.company_id)
      .eq('role', 'employee')
    setEmployees(emps || [])

    // Fetch logs with profile join
    let query = supabase
      .from('daily_logs')
      .select('*, profiles(*)')
      .order('log_date', { ascending: false })

    if (filterEmployee !== 'all') {
      query = query.eq('employee_id', filterEmployee)
    }
    if (filterDate) {
      query = query.eq('log_date', filterDate)
    }

    const { data } = await query
    setLogs(data as any || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filterEmployee, filterDate])

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <ClipboardList className="w-8 h-8 mr-4 text-slate-400" />
            Productivity Logs
          </h2>
          <p className="text-slate-500 font-medium italic">Monitor and provide feedback on daily accomplishments.</p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Filter className="w-3.5 h-3.5 mr-2" />
              Refine:
           </div>
           <Select value={filterEmployee} onValueChange={setFilterEmployee}>
             <SelectTrigger className="w-40 h-10 border-slate-100 rounded-xl font-bold bg-slate-50 text-xs">
               <SelectValue placeholder="Team Member" />
             </SelectTrigger>
             <SelectContent className="bg-white rounded-xl shadow-xl">
               <SelectItem value="all" className="font-bold">All Members</SelectItem>
               {employees.map(emp => (
                 <SelectItem key={emp.id} value={emp.id} className="font-bold">{emp.full_name}</SelectItem>
               ))}
             </SelectContent>
           </Select>
           <Input 
             type="date" 
             value={filterDate}
             onChange={(e) => setFilterDate(e.target.value)}
             className="w-40 h-10 border-slate-100 rounded-xl font-bold bg-slate-50 text-xs"
           />
        </div>
      </header>

      <div className="space-y-8">
        {loading ? (
          [1,2].map(i => <Skeleton key={i} className="h-96 w-full rounded-3xl" />)
        ) : logs.length > 0 ? (
          logs.map(log => (
            <LogReviewCard key={log.id} log={log} onReview={fetchData} />
          ))
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-black text-slate-700 uppercase tracking-tight">No logs found</h3>
             <p className="text-slate-400 font-medium max-w-[280px] mt-2 italic">Adjust your filters or wait for employees to submit their reports.</p>
          </div>
        )}
      </div>
    </div>
  )
}
