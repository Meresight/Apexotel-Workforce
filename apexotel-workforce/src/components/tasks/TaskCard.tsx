'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MoreVertical, Play, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import type { Task } from '@/lib/types/database'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onUpdate: () => void
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [loading, setLoading] = useState(false)

  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    if (res.ok) {
      onUpdate()
    }
    setLoading(false)
  }

  const priorityConfig = {
    high: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', dot: 'bg-rose-500' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' },
    low: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500' }
  }

  const config = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.low

  return (
    <div className="group relative bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
      {/* Visual Indicator */}
      <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-all duration-500 group-hover:w-2", config.dot)} />

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
            config.bg, config.color, config.border
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)]", config.dot)} />
            {task.priority} Priority
          </div>
          <button className="p-1.5 rounded-xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-sm font-black text-slate-950 tracking-tight leading-snug mb-2 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>

        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6 leading-relaxed">
          {task.description || 'System generated operational objective.'}
        </p>

        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
          {task.due_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {format(new Date(task.created_at), 'MMM d')}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-3">
        {task.status === 'pending' && (
          <button 
            onClick={() => updateStatus('in_progress')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-[#020617] hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            <Play className="w-3 h-3 fill-current" />
            Engage Task
          </button>
        )}

        {task.status === 'in_progress' && (
          <button 
            onClick={() => updateStatus('done')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalize Task
          </button>
        )}

        {task.status === 'done' && (
          <div className="flex-1 flex items-center justify-center gap-2 h-11 bg-slate-200/50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
            <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center scale-90">
               <CheckCircle2 className="w-3 h-3" />
            </div>
            Operations Complete
          </div>
        )}
      </div>
    </div>
  )
}
