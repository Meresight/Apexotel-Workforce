'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TimeEntry } from '@/lib/types/database'
import { calculateDecimalHours } from '@/lib/utils/time'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimecardTableProps {
  entries: TimeEntry[]
}

export default function TimecardTable({ entries }: TimecardTableProps) {
  const calculateTotals = () => {
    let total = 0
    let regular = 0
    let overtime = 0

    entries.forEach(e => {
      if (e.clock_in && e.clock_out) {
        const hours = calculateDecimalHours(e.clock_in, e.clock_out)
        total += hours
        regular += Math.min(hours, 8)
        overtime += Math.max(hours - 8, 0)
      }
    })

    return { total, regular, overtime }
  }

  const { total, regular, overtime } = calculateTotals()

  const exportCSV = () => {
    const headers = ['Date', 'Clock In', 'Clock Out', 'Hours', 'Status']
    const rows = entries.map(e => [
      e.work_date,
      e.clock_in ? format(parseISO(e.clock_in), 'HH:mm') : '--',
      e.clock_out ? format(parseISO(e.clock_out), 'HH:mm') : 'MISSING',
      e.clock_in && e.clock_out ? calculateDecimalHours(e.clock_in, e.clock_out) : '0',
      e.status
    ])

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timecard_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl shadow-xl">
        <div className="flex space-x-12">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Regular Hours</span>
              <span className="text-3xl font-black text-white">{regular.toFixed(2)}h</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Overtime</span>
              <span className="text-3xl font-black text-red-400">{overtime.toFixed(2)}h</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Grand Total</span>
              <span className="text-3xl font-black text-green-400">{total.toFixed(2)}h</span>
           </div>
        </div>
        <Button 
          onClick={exportCSV} 
          variant="outline" 
          className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold h-12 px-6 rounded-2xl transition-all"
        >
          <Download className="w-5 h-5 mr-3 text-blue-400" />
          Export Dataset
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-100">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-8 h-12">Date</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Punch In</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Punch Out</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length > 0 ? (
              entries.map((entry) => {
                const hours = entry.clock_in && entry.clock_out ? calculateDecimalHours(entry.clock_in, entry.clock_out) : 0
                const isMissingPunch = entry.clock_in && !entry.clock_out
                
                return (
                  <TableRow key={entry.id} className="border-slate-100 hover:bg-slate-50/30">
                    <TableCell className="pl-8 py-5 font-black text-slate-900 whitespace-nowrap">
                      {format(parseISO(entry.work_date), 'EEE, MMM d')}
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-black text-[9px] uppercase tracking-tighter px-2.5 py-1 border-none ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        isMissingPunch ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-700'
                      }`}>
                         {isMissingPunch ? 'Missing Punch' : entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-600">
                      {entry.clock_in ? format(parseISO(entry.clock_in), 'h:mm a') : '--'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-600">
                      {entry.clock_out ? format(parseISO(entry.clock_out), 'h:mm a') : (
                        isMissingPunch ? (
                          <span className="flex items-center text-red-500 italic">
                             <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                             Action Required
                          </span>
                        ) : '--'
                      )}
                    </TableCell>
                    <TableCell className="pr-8 text-right font-black text-slate-900">
                      {hours > 0 ? `${hours.toFixed(2)}h` : '--'}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-sm font-bold text-slate-400 italic">
                  No time entries found for this selection.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
