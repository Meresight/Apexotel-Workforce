import { createServerClient } from '@/lib/supabase/server'
import ClockWidget from '@/components/clock/ClockWidget'
import { CheckSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeeDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', session?.user.id)
    .in('status', ['todo', 'in_progress'])
    .limit(5)

  const today = new Date().toISOString().split('T')[0]
  const { data: dailyLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('employee_id', session?.user.id)
    .eq('log_date', today)
    .maybeSingle()

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your time and track daily progress</p>
      </div>

      {/* Daily Log Alert */}
      {!dailyLog && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Daily log missing</p>
            <p className="text-xs text-amber-700 mt-0.5">You haven't submitted your log for today yet.</p>
          </div>
          <Link href="/dashboard/employee/log"
            className="shrink-0 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            Submit Now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock Widget */}
        <div className="lg:col-span-1">
          <ClockWidget />
        </div>

        {/* Tasks Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">Active Tasks</span>
            </div>
            <Link href="/dashboard/employee/tasks" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
              View all →
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {tasks && tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <span className={`text-xs font-medium mt-0.5 ${
                    task.priority === 'high' ? 'text-red-500' :
                    task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {task.priority} priority
                  </span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  task.status === 'in_progress'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            )) : (
              <div className="py-16 text-center">
                <CheckSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">No active tasks assigned to you</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
