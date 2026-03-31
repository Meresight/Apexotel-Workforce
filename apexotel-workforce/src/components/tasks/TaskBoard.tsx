'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TaskCard from '@/components/tasks/TaskCard'
import type { Task, Profile } from '@/lib/types/database'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Kanban, Users, Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()
    if (!profile) return

    const { data: emps } = await supabase.from('profiles').select('*').eq('company_id', profile.company_id).eq('role', 'employee')
    setEmployees(emps || [])

    let query = supabase.from('tasks').select('*').eq('company_id', profile.company_id)
    if (filterEmployeeId !== 'all') query = query.eq('assigned_to', filterEmployeeId)

    const { data } = await query.order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const channel = supabase.channel('boss-tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [filterEmployeeId])

  const columns = [
    { id: 'pending', title: 'Pending', color: 'bg-slate-300' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-600' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Kanban className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 pt-0.5">Board View</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-slate-400" />
            <Select value={filterEmployeeId} onValueChange={setFilterEmployeeId}>
              <SelectTrigger className="w-48 h-10 border-none rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-100 hover:bg-slate-200 transition-colors focus:ring-0">
                <SelectValue placeholder="All Personnel" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-2xl shadow-2xl border-slate-200 p-2">
                <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest py-3">Global Roster</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id} className="font-bold text-xs py-3">{emp.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-20">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col space-y-6 group/col">
            <div className="flex items-center justify-between px-4 h-10">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", col.color)} />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950">{col.title}</h3>
              </div>
              <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                <span className="text-[10px] font-black text-slate-900">{tasks.filter(t => t.status === col.id).length}</span>
              </div>
            </div>
            <div className="bg-slate-50/50 backdrop-blur-sm p-5 rounded-[2.5rem] border-2 border-dashed border-slate-200/50 min-h-[600px] space-y-5 transition-all group-hover/col:bg-slate-100/50 group-hover/col:border-slate-300/50">
              {loading ? (
                <Skeleton className="h-32 w-full rounded-[2rem] bg-white/60" />
              ) : (
                tasks.filter(t => t.status === col.id).map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchData} />
                ))
              )}
              {tasks.filter(t => t.status === col.id).length === 0 && !loading && (
                <div className="h-[200px] flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
                    <Plus className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Void Segment</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
