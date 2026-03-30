'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TaskCard from '@/components/tasks/TaskCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Task } from '@/lib/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardList } from 'lucide-react'

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false })

    setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()

    // Realtime subscription
    const channel = supabase
      .channel('my-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => { fetchTasks() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const pending = tasks.filter(t => t.status === 'pending')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Tasks</h2>
          <p className="text-slate-500 font-medium italic">Track your progress and update status</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-4 py-2 bg-slate-900 rounded-xl text-white text-xs font-black uppercase tracking-widest">
            {tasks.length} Total
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="bg-slate-100 p-1.5 h-12 rounded-2xl border border-slate-200">
            <TabsTrigger value="all" className="rounded-xl px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">In Progress ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="done" className="rounded-xl px-6 py-2 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Done ({done.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
             {tasks.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {tasks.map(task => (
                   <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                 ))}
               </div>
             ) : <EmptyState />}
          </TabsContent>
          <TabsContent value="pending" className="mt-0">
             {pending.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {pending.map(task => (
                   <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                 ))}
               </div>
             ) : <EmptyState />}
          </TabsContent>
          <TabsContent value="active" className="mt-0">
             {inProgress.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {inProgress.map(task => (
                   <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                 ))}
               </div>
             ) : <EmptyState />}
          </TabsContent>
          <TabsContent value="done" className="mt-0">
             {done.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {done.map(task => (
                   <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                 ))}
               </div>
             ) : <EmptyState />}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
        <ClipboardList className="w-8 h-8 text-slate-200" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-700 mb-1">Clear as day!</h3>
      <p className="text-slate-400 font-medium max-w-[240px]">No tasks found in this category. Take a moment to breathe.</p>
    </div>
  )
}
