'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MoreVertical, Play, CheckCircle2 } from 'lucide-react'
import type { Task } from '@/lib/types/database'
import { format } from 'date-fns'

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

  const priorityColors = {
    high: 'bg-red-500 shadow-red-100 text-white',
    medium: 'bg-amber-500 shadow-amber-100 text-white',
    low: 'bg-blue-500 shadow-blue-100 text-white'
  }

  return (
    <Card className="group border-slate-200 hover:border-slate-400 transition-all duration-300 shadow-sm hover:shadow-md bg-white overflow-hidden">
      <div className={`h-1.5 w-full ${
        task.priority === 'high' ? 'bg-red-500' : 
        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
      }`} />
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start">
          <Badge className={`${priorityColors[task.priority]} border-none font-black text-[10px] px-2 py-0.5 uppercase tracking-tighter`}>
            {task.priority}
          </Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-900">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-base font-bold text-slate-800 mt-2 leading-tight group-hover:text-slate-900 transition-colors">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
        <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {task.due_date && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(task.due_date), 'MMM d')}
            </div>
          )}
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {format(new Date(task.created_at), 'MMM d')}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-slate-50 bg-slate-50/30">
        {task.status === 'pending' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-all"
            onClick={() => updateStatus('in_progress')}
            disabled={loading}
          >
            <Play className="w-3 h-3 mr-2 fill-current" />
            Start Task
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 text-xs font-bold border-green-200 text-green-700 hover:bg-green-600 hover:text-white transition-all"
            onClick={() => updateStatus('done')}
            disabled={loading}
          >
            <CheckCircle2 className="w-3 h-3 mr-2" />
            Mark Done
          </Button>
        )}
        {task.status === 'done' && (
          <div className="w-full flex items-center justify-center space-x-2 text-[10px] font-black text-green-600 uppercase py-2 tracking-widest italic">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
