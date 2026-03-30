'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, MessageSquare, Clock, FileText } from 'lucide-react'
import type { DailyLog, Profile } from '@/lib/types/database'
import { format, parseISO } from 'date-fns'

interface LogReviewCardProps {
  log: DailyLog & { profiles: Profile }
  onReview: () => void
}

export default function LogReviewCard({ log, onReview }: LogReviewCardProps) {
  const [note, setNote] = useState(log.boss_note || '')
  const [loading, setLoading] = useState(false)

  const handleReview = async () => {
    setLoading(true)
    const res = await fetch(`/api/logs/${log.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boss_note: note, status: 'reviewed' })
    })
    if (res.ok) {
      onReview()
    }
    setLoading(false)
  }

  return (
    <Card className={`group border-l-8 transition-all duration-300 shadow-xl rounded-3xl overflow-hidden bg-white ${
      log.status === 'reviewed' ? 'border-l-green-500' : 'border-l-amber-500 shadow-amber-50'
    }`}>
      <CardHeader className="bg-slate-900 border-b border-slate-800 p-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-slate-700 font-bold bg-slate-800 text-white shadow-sm">
              <AvatarImage src={log.profiles.avatar_url || ''} />
              <AvatarFallback>{log.profiles.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-black text-white leading-tight">{log.profiles.full_name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Logged on {format(parseISO(log.log_date), 'EEEE, MMM do')}
              </p>
            </div>
          </div>
          <Badge className={`font-black text-[10px] uppercase tracking-tighter px-3 py-1 border-none shadow-sm ${
            log.status === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {log.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        <div className="space-y-2">
           <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <FileText className="w-3 h-3 mr-2 text-slate-900" />
              Summary of Work
           </div>
           <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
             {log.summary}
           </p>
        </div>

        {log.tasks_completed && log.tasks_completed.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                Tasks Completed
             </div>
             <div className="flex flex-wrap gap-2">
               {log.tasks_completed.map((taskId, idx) => (
                 <Badge key={idx} variant="outline" className="bg-green-50/50 text-green-700 border-green-100 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter italic">
                   Task Ref: {taskId.substring(0, 8)}
                 </Badge>
               ))}
             </div>
          </div>
        )}

        <div className="space-y-3 pt-6 border-t border-slate-50">
           <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <MessageSquare className="w-3 h-3 mr-2" />
              Direct Boss Feedback
           </div>
           <Textarea 
             placeholder="Add a note or feedback for the employee..."
             value={note}
             onChange={(e) => setNote(e.target.value)}
             className="min-h-[100px] border-slate-200 rounded-2xl p-4 text-sm font-medium bg-slate-50/50 focus:ring-slate-300"
             disabled={log.status === 'reviewed' && !note}
           />
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 p-6 flex justify-end">
        {log.status !== 'reviewed' && (
          <Button 
            onClick={handleReview}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-12 px-10 rounded-2xl shadow-xl transition-all active:scale-95 border-b-4 border-slate-950"
          >
            {loading ? 'Processing...' : (
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-3 text-green-400" />
                Mark as Reviewed
              </span>
            )}
          </Button>
        )}
        {log.status === 'reviewed' && (
           <div className="flex items-center text-[10px] font-black text-green-600 uppercase tracking-widest italic py-2">
              <CheckCircle2 className="w-5 h-5 mr-3" />
              Feedback Delivered & Reviewed
           </div>
        )}
      </CardFooter>
    </Card>
  )
}
