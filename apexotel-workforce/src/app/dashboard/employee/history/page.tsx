'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import { Clock, History as HistoryIcon, MapPin } from 'lucide-react'
import type { TimeEntry } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'

export default function EmployeeHistoryPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchEntries = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', user.id)
        .order('work_date', { ascending: false })
        .limit(50)

      setEntries(data || [])
      setLoading(false)
    }

    fetchEntries()
  }, [])

  const statusColors = {
    open: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    flagged: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Time History</h2>
        <p className="text-slate-500 font-medium">Review your past clock-in and clock-out logs.</p>
      </header>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
            <HistoryIcon className="w-5 h-5 mr-3 text-slate-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-100">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-6">Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clock In</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clock Out</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pr-6 text-right">Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={5} className="h-14"><div className="bg-slate-50 w-full h-full rounded" /></TableCell>
                  </TableRow>
                ))
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow key={entry.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 font-bold text-slate-900 text-sm">
                      {format(parseISO(entry.work_date), 'EEE, MMM d')}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600">
                      {format(parseISO(entry.clock_in), 'h:mm a')}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600">
                      {entry.clock_out ? format(parseISO(entry.clock_out), 'h:mm a') : (
                        <span className="flex items-center text-green-600 font-bold italic animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          Live Now
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 border-none ${statusColors[entry.status]}`}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {entry.location ? (
                        <div className="flex items-center justify-end text-slate-400 group">
                           <MapPin className="w-3.5 h-3.5" />
                           <span className="ml-1 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Captured</span>
                        </div>
                      ) : <span className="text-slate-200">--</span>}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <p className="text-sm font-bold text-slate-400 italic">No time entries found yet.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
