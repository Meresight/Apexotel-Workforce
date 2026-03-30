'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TaskCard from '@/components/tasks/TaskCard'
import type { Task, Profile } from '@/lib/types/database'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    // Fetch employees for filter
    const { data: emps } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('role', 'employee')
    
    setEmployees(emps || [])

    // Fetch tasks
    let query = supabase.from('tasks').select('*').eq('company_id', profile.company_id)
    if (filterEmployeeId !== 'all') {
      query = query.eq('assigned_to', filterEmployeeId)
    }

    const { data } = await query.order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('boss-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [filterEmployeeId])

  const columns = [
    { id: 'pending', title: 'Pending', color: 'bg-slate-200' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-fit">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Filter by Employee:</span>
        <Select 
          value={filterEmployeeId} 
          onValueChange={setFilterEmployeeId}
        >
          <SelectTrigger className="w-48 h-10 border-slate-200 rounded-xl font-bold bg-slate-50">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-xl shadow-xl">
             <SelectItem value="all" className="font-bold text-slate-900">All Employees</SelectItem>
             {employees.map(emp => (
               <SelectItem key={emp.id} value={emp.id} className="font-bold text-slate-700">{emp.full_name}</SelectItem>
             ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${col.color}`} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{col.title}</h3>
               </div>
               <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 rounded-full text-slate-400">
                  {tasks.filter(t => t.status === col.id).length}
               </span>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-[2rem] border-2 border-dashed border-slate-100 min-h-[500px] space-y-4">
              {loading ? (
                <Skeleton className="h-32 w-full rounded-2xl" />
              ) : (
                tasks.filter(t => t.status === col.id).map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchData} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
