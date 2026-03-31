'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ClipboardList, CheckCircle2, Save, Sparkles, Send, Info, Calendar } from 'lucide-react'
import type { Task, DailyLog } from '@/lib/types/database'
import { cn } from '@/lib/utils'

export default function DailyLogForm() {
  const [summary, setSummary] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingLog, setExistingLog] = useState<DailyLog | null>(null)
  
  const supabase = createClient()
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: log } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('employee_id', user.id)
        .eq('log_date', today)
        .maybeSingle()

      if (log) {
        setExistingLog(log)
        setSummary(log.summary)
        setSelectedTasks(log.tasks_completed || [])
      }

      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .eq('status', 'done')
        .gte('updated_at', `${today}T00:00:00Z`)

      setTasks(completedTasks || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log_date: today,
        summary,
        tasks_completed: selectedTasks,
        status: 'submitted'
      })
    })

    if (res.ok) {
      router.push('/dashboard/employee')
    } else {
      alert('Failed to submit log')
    }
    setSubmitting(false)
  }

  const toggleTask = (taskId: string) => {
    if (existingLog?.status === 'reviewed') return
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    )
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
       <div className="h-[400px] bg-slate-50 rounded-[2.5rem] animate-pulse" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700 pb-20 selection:bg-blue-100">
      {/* Premium Header Card */}
      <div className="bg-[#020617] rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl mb-10">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
           <ClipboardList className="w-64 h-64 -translate-y-10 translate-x-10 text-blue-400" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-7 h-7 text-white" />
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Daily Log Portal</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest pt-0.5">
                   {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
             </div>
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-md flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pt-0.5">Transmission Active</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 p-8 md:p-12 space-y-10">
          
          {/* Summary Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              Accomplishment Intelligence
            </label>
            <Textarea 
              placeholder="Synthesize your daily activities, challenges, and primary objectives completed today..."
              className="min-h-[200px] border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 rounded-[1.5rem] p-6 text-sm font-medium leading-relaxed bg-slate-50 transition-all placeholder:text-slate-400"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              disabled={existingLog?.status === 'reviewed'}
            />
          </div>

          {/* Tasks Section */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                 Validated Tasks
               </label>
               {tasks.length > 0 && (
                 <span className="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest">
                    {selectedTasks.length} / {tasks.length} Selected
                 </span>
               )}
            </div>

            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "group relative flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer",
                      selectedTasks.includes(task.id) 
                        ? 'border-emerald-500/20 bg-emerald-50/50 shadow-sm' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    )}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className={cn(
                       "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                       selectedTasks.includes(task.id) 
                         ? "bg-emerald-500 border-emerald-500" 
                         : "bg-white border-slate-200 group-hover:border-slate-300"
                    )}>
                       {selectedTasks.includes(task.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <p className={cn(
                         "text-xs leading-none tracking-tight",
                         selectedTasks.includes(task.id) ? "font-black text-emerald-950" : "font-bold text-slate-900"
                       )}>
                         {task.title}
                       </p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         Completed Strategy
                       </p>
                    </div>

                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      selectedTasks.includes(task.id) ? "bg-white text-emerald-500 scale-100 shadow-sm" : "opacity-0 scale-50"
                    )}>
                       <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-200/50">
                   <Info className="w-6 h-6 text-slate-200" />
                </div>
                <h3 className="text-sm font-black text-slate-950 tracking-tight">No completed items detected</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] max-w-xs mx-auto leading-relaxed mt-2">
                   Only tasks marked as 'Done' in your active board will appear here for verification.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl shadow-slate-200/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
               <Info className="w-5 h-5 text-slate-400" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest leading-none">Status Summary</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">
                  {existingLog ? 'Revision Protocol Active' : 'Ready for Strategic Filing'}
               </p>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="bg-[#020617] hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs h-16 px-12 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 w-full md:w-auto"
            disabled={submitting || existingLog?.status === 'reviewed'}
          >
            {submitting ? (
              'Transmitting Intelligence...'
            ) : (
              <>
                <Send className="w-4 h-4 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                {existingLog ? 'Update Intelligence' : 'Deploy Daily Report'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
