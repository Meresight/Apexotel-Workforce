'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface TimecardApprovalProps {
  employeeId: string
  employeeName: string
  periodStart: string
  periodEnd: string
  onApproved: () => void
}

export default function TimecardApproval({ 
  employeeId, 
  employeeName, 
  periodStart, 
  periodEnd, 
  onApproved 
}: TimecardApprovalProps) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    const res = await fetch(`/api/timecards/${employeeId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: employeeId,
        period_start: periodStart,
        period_end: periodEnd,
        boss_note: note
      })
    })

    if (res.ok) {
      onApproved()
      alert('Timecard approved successfully!')
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to approve timecard')
    }
    setLoading(false)
  }

  return (
    <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden mt-8">
      <div className="bg-slate-900 p-8">
        <h3 className="text-xl font-black text-white flex items-center uppercase tracking-tight">
          <CheckCircle2 className="w-6 h-6 mr-3 text-green-400" />
          Final Timecard Approval
        </h3>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px] mt-1">
          Review for {employeeName}
        </p>
      </div>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <MessageSquare className="w-3.5 h-3.5 mr-2 text-slate-900" />
            Boss Approval Note (Optional)
          </Label>
          <Textarea 
            placeholder="Add comments regarding performance or adjustments..."
            className="min-h-[120px] border-slate-200 rounded-2xl bg-slate-50 focus:ring-slate-300 p-4 font-medium"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
           <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
           <p className="text-xs font-bold text-amber-800 leading-relaxed">
             Approving this timecard will lock all entries in the selected period and generate a final record for payroll. This action cannot be undone.
           </p>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 p-8 flex justify-end">
        <Button 
          onClick={handleApprove}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-xl transition-all active:scale-95 border-b-4 border-green-800"
        >
          {loading ? 'Finalizing...' : (
            <span className="flex items-center">
              Confirm & Approve Timecard
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
