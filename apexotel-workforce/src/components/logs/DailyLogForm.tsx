'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ClipboardList, CheckCircle2, Save } from 'lucide-react'
import type { Task, DailyLog } from '@/lib/types/database'

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

      // 1. Fetch today's log
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

      // 2. Fetch today's completed tasks
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
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    )
  }

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-64 bg-slate-100 rounded-2xl" /></div>

  return (
    <Card className="max-w-3xl mx-auto border-slate-200 shadow-xl overflow-hidden bg-white">
      <CardHeader className="bg-slate-900 px-8 py-10 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <ClipboardList className="w-64 h-64 -translate-y-10 -translate-x-10 text-white" />
        </div>
        <CardTitle className="text-3xl font-black text-white tracking-tight flex items-center relative z-10 uppercase">
          <ClipboardList className="w-8 h-8 mr-4 text-blue-400" />
          End of Day Log
        </CardTitle>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-2 relative z-10">
          Reporting for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="px-8 py-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
              Accomplishment Summary
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </Label>
            <Textarea 
              placeholder="Describe what you worked on today, any challenges faced, or key wins..."
              className="min-h-[160px] border-slate-200 focus:ring-slate-300 rounded-xl p-4 text-sm font-medium leading-relaxed"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              disabled={existingLog?.status === 'reviewed'}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <Label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
              Tasks Completed Today
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-green-500" />
            </Label>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedTasks.includes(task.id) 
                        ? 'border-green-300 bg-green-50 font-bold text-green-900 shadow-sm' 
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox 
                      id={task.id} 
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <label 
                      htmlFor={task.id} 
                      className="text-xs flex-1 cursor-pointer select-none leading-none"
                    >
                      {task.title}
                    </label>
                    <CheckCircle2 className={`w-4 h-4 ${selectedTasks.includes(task.id) ? 'text-green-600 opacity-100' : 'text-slate-200 opacity-0'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 italic">No tasks were marked as 'Done' today.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
            {existingLog ? 'Log already exists (Updating)' : 'Ready to submit'}
          </p>
          <Button 
            type="submit" 
            className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            disabled={submitting || existingLog?.status === 'reviewed'}
          >
            {submitting ? 'Submitting...' : (
              <span className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                {existingLog ? 'Update Log' : 'Submit End of Day Log'}
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
