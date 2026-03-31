'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TimeEntry } from '@/lib/types/database'
import { calculateAdjustedHours } from '@/lib/utils/time'
import { format, parseISO, eachDayOfInterval, endOfMonth, getDate } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle, Clock, Timer, Calculator, Info, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimecardPeriodViewProps {
  employeeId: string
  entries: TimeEntry[]
  period: '1-15' | '16-end'
  year: number
  month: number
  onUpdate?: () => void
}

export default function TimecardPeriodView({ 
  employeeId,
  entries, 
  period,
  year,
  month,
  onUpdate 
}: TimecardPeriodViewProps) {
  const [localEntries, setLocalEntries] = useState<Record<number, Partial<TimeEntry>>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const monthDate = new Date(year, month - 1)
  const start = period === '1-15' ? new Date(year, month - 1, 1) : new Date(year, month - 1, 16)
  const end = period === '1-15' ? new Date(year, month - 1, 15) : endOfMonth(monthDate)
  const days = eachDayOfInterval({ start, end })

  useEffect(() => {
    const entryMap: Record<number, Partial<TimeEntry>> = {}
    entries.forEach(e => entryMap[getDate(parseISO(e.work_date))] = e)
    setLocalEntries(entryMap)
  }, [entries])

  const handleAdjustChange = (dayNum: number, field: 'adjust_in' | 'adjust_out', value: string) => {
    setLocalEntries(prev => ({ ...prev, [dayNum]: { ...prev[dayNum], [field]: value }}))
  }

  const saveAdjustment = async (dayNum: number) => {
    const entry = localEntries[dayNum]
    if (!entry) return
    setSaving(`${dayNum}`)
    try {
      const res = await fetch('/api/time-entries/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          work_date: format(new Date(year, month - 1, dayNum), 'yyyy-MM-dd'),
          adjust_in: entry.adjust_in,
          adjust_out: entry.adjust_out
        })
      })
      if (res.ok && onUpdate) onUpdate()
    } catch (err) { console.error(err) } finally { setSaving(null) }
  }

  const calculateTotals = () => {
    let totalHours = 0
    days.forEach(day => {
      const entry = localEntries[getDate(day)]
      if (entry) totalHours += calculateAdjustedHours(entry.adjust_in || null, entry.adjust_out || null)
    })
    const totalSalary = (totalHours / 8) * 600
    const ta = totalHours > 0 ? 250 : 0
    return { totalHours, totalSalary, ta, grandTotal: totalSalary + ta }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-10 selection:bg-blue-100">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#020617] border-none">
            <TableRow className="hover:bg-transparent border-none h-20">
              <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px] pl-10 w-24">Index</TableHead>
              <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px] text-center border-l border-white/10" colSpan={2}>Clock In Entry</TableHead>
              <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px] text-center border-l border-white/10" colSpan={2}>Clock Out Entry</TableHead>
              <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px] text-right pr-10 border-l border-white/10">Audit Total</TableHead>
            </TableRow>
            <TableRow className="bg-[#020617] border-none h-12">
              <TableHead />
              <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center border-l border-white/5">Primary</TableHead>
              <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center border-l border-white/5">Adjusted</TableHead>
              <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center border-l border-white/5">Primary</TableHead>
              <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center border-l border-white/5">Adjusted</TableHead>
              <TableHead className="border-l border-white/5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map((day) => {
              const dayNum = getDate(day)
              const entry = localEntries[dayNum]
              const hasRecord = !!entry?.clock_in
              const dailyHours = hasRecord ? calculateAdjustedHours(entry.adjust_in || null, entry.adjust_out || null) : 0

              return (
                <TableRow key={dayNum} className="border-slate-50 hover:bg-blue-50/30 transition-all group/row h-16">
                  <TableCell className="pl-10 font-black text-slate-300 group-hover/row:text-blue-600 transition-colors">
                    {dayNum.toString().padStart(2, '0')}
                  </TableCell>
                  
                  <TableCell className="text-center text-xs font-black text-slate-900 border-l border-slate-50">
                    {entry?.clock_in ? format(parseISO(entry.clock_in), 'HH:mm') : <span className="opacity-20">--</span>}
                  </TableCell>
                  <TableCell className="text-center border-l border-slate-50 p-2">
                    {hasRecord ? (
                      <Input 
                        type="time" 
                        value={entry.adjust_in || ''} 
                        onChange={(e) => handleAdjustChange(dayNum, 'adjust_in', e.target.value)}
                        className="h-9 text-[11px] font-black border-slate-100 bg-slate-50 focus:bg-white rounded-xl text-center p-0 transition-all focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20"
                      />
                    ) : <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Day Off</div>}
                  </TableCell>

                  <TableCell className="text-center text-xs font-black text-slate-900 border-l border-slate-50">
                    {entry?.clock_out ? format(parseISO(entry.clock_out), 'HH:mm') : (hasRecord ? <span className="text-rose-500 underline decoration-rose-500/30 decoration-2 underline-offset-4">MISSING</span> : <span className="opacity-20">--</span>)}
                  </TableCell>
                  <TableCell className="text-center border-l border-slate-50 p-2">
                    {hasRecord ? (
                      <div className="flex items-center gap-2 group/action">
                        <Input 
                          type="time" 
                          value={entry.adjust_out || ''} 
                          onChange={(e) => handleAdjustChange(dayNum, 'adjust_out', e.target.value)}
                          className="h-9 text-[11px] font-black border-slate-100 bg-slate-50 focus:bg-white rounded-xl text-center p-0 transition-all focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 flex-1"
                        />
                        <button 
                          onClick={() => saveAdjustment(dayNum)}
                          disabled={saving === `${dayNum}`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-90 transition-all opacity-0 group-hover/row:opacity-100 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    ) : <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Day Off</div>}
                  </TableCell>

                  <TableCell className={cn(
                    "text-right pr-10 font-black border-l border-slate-50",
                    hasRecord && dailyHours > 0 ? 'text-slate-950' : 'text-slate-300 italic text-[10px] uppercase tracking-widest'
                  )}>
                    {hasRecord ? (dailyHours > 0 ? dailyHours.toFixed(1) : 'AUDIT PENDING') : 'INACTIVE'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary Audit Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col justify-center space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                 <AlertCircle className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-950 pt-1">Auditor Intel</h4>
           </div>
           <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-md">
             Calculations are synchronized with standard <span className="text-slate-950">PHP 600.00/shift</span> baseline. 
             Mandatory lunch deductions are automatically subtracted from verified timestamps. 
             Adjusted entries must be locked by saving individually.
           </p>
           <div className="flex items-center gap-3 pt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Adjusted</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Day Off</span>
              </div>
           </div>
        </div>

        <div className="bg-[#020617] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calculator className="w-48 h-48 text-blue-400" />
           </div>
           
           <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start border-b border-white/10 pb-8">
                 <div>
                    <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Total Workforce Production</h5>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black text-white">{totals.totalHours.toFixed(1)}</span>
                       <span className="text-sm font-black text-white/30 uppercase tracking-widest">Accumulated Hrs</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <TrendingUp className="w-8 h-8 text-blue-500/30 ml-auto" />
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-white/30 font-black uppercase tracking-[0.2em] text-[9px]">Calculated Output</span>
                    <span className="font-black text-white tabular-nums">₱{totals.totalSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-white/30 font-black uppercase tracking-[0.2em] text-[9px]">Travel Allowance</span>
                    <span className="font-black text-white tabular-nums">₱{totals.ta.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <Timer className="w-5 h-5 text-white" />
                       </div>
                       <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] pt-1">Grand Payroll Value</span>
                    </div>
                    <span className="text-3xl font-black text-emerald-400 tabular-nums shadow-emerald-500/10 shadow-2xl">₱{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
