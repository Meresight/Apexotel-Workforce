import { createServerClient } from '@/lib/supabase/server'
import ClockWidget from '@/components/clock/ClockWidget'
import { CheckSquare, AlertCircle, ArrowRight, Zap, ListTodo, ClipboardCheck, Sparkles, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

  const userName = session?.user.user_metadata?.full_name || 'Team Member'

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 selection:bg-blue-100">
      {/* Header & Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-3xl font-black text-slate-950 tracking-tight">Bonjour, {userName.split(' ')[0]}!</h1>
          </div>
          <p className="text-slate-500 font-medium pl-1">Here is your operational overview for today.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
           <Calendar className="w-4 h-4 text-slate-400" />
           <span className="text-xs font-black text-slate-900 uppercase tracking-widest pt-0.5">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
           </span>
        </div>
      </div>

      {/* Critical Alerts */}
      {!dailyLog && (
        <div className="relative group overflow-hidden bg-white border border-amber-200 rounded-[2.5rem] p-8 shadow-2xl shadow-amber-200/20 animate-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <ClipboardCheck className="w-32 h-32 text-amber-900" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/5 shrink-0">
               <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Daily Log Required</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                You haven't documented your progress for today yet. Submitting your daily log ensures accurate reporting and payroll alignment.
              </p>
            </div>
            <Link href="/dashboard/employee/log"
              className="group/link flex items-center gap-3 bg-amber-900 hover:bg-amber-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-900/10 active:scale-95">
              Submit Now
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Clock Widget Section */}
        <div className="lg:col-span-5 xl:col-span-4">
           <ClockWidget />
        </div>

        {/* Tasks Section */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
                <ListTodo className="w-4 h-4 text-slate-400" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Priority Assignments</h2>
             </div>
             <Link href="/dashboard/employee/tasks" className="group flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors">
                View All
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
             </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="divide-y divide-slate-100">
              {tasks && tasks.length > 0 ? tasks.map((task, i) => (
                <div key={task.id} className="group flex items-center gap-6 p-6 hover:bg-slate-50/50 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-300 group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                     0{i + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{task.title}</p>
                    <div className="flex items-center gap-3">
                       <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                          task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                       )}>
                          {task.priority} Priority
                       </span>
                       <span className="text-[10px] text-slate-300 font-bold">•</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {task.status.replace('_', ' ')}
                       </span>
                    </div>
                  </div>
                  <div className="p-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                     <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <CheckSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-black text-slate-950 tracking-tight">All caught up!</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">No pending tasks assigned to you at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
