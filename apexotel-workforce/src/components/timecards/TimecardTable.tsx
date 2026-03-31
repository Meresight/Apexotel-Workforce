'use client'

import type { TimeEntry } from '@/lib/types/database'
import TimecardPeriodView from './TimecardPeriodView'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Layers, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface TimecardTableProps {
  employeeId: string
  entries: TimeEntry[]
  onUpdate?: () => void
}

export default function TimecardTable({ employeeId, entries, onUpdate }: TimecardTableProps) {
  const [period, setPeriod] = useState<'1-15' | '16-end'>('1-15')
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-36 border-none bg-transparent font-black text-[10px] uppercase tracking-[0.2em] h-6 focus:ring-0 p-0">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-2xl shadow-2xl border-slate-200 p-2">
                   <SelectItem value="1-15" className="font-black text-[10px] uppercase tracking-widest py-3 rounded-xl">Primary Segment</SelectItem>
                   <SelectItem value="16-end" className="font-black text-[10px] uppercase tracking-widest py-3 rounded-xl">Closing Segment</SelectItem>
                </SelectContent>
              </Select>
           </div>
           
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1.5 ml-1">Archive Month</span>
              <p className="text-xs text-slate-950 font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3 text-slate-300" />
                {format(new Date(year, month - 1), 'MMMM yyyy')}
              </p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Audit Mode</span>
           </div>
        </div>
      </div>

      <TimecardPeriodView 
        employeeId={employeeId}
        entries={entries}
        period={period}
        year={year}
        month={month}
        onUpdate={onUpdate}
      />
    </div>
  )
}
