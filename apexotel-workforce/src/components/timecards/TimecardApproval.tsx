'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { CheckCircle2, MessageSquare, AlertCircle, ShieldCheck, Lock, Send, Sparkles } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to approve timecard')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden selection:bg-emerald-100">
      <div className="bg-[#020617] p-10 md:p-14 relative overflow-hidden">
        {/* Visual Decor */}
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
           <ShieldCheck className="w-48 h-48 -translate-y-6 translate-x-6 text-emerald-400" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Lock className="w-6 h-6 text-white" />
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Final Payroll Seal</h3>
          </div>
          <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px] pl-1 flex items-center gap-3">
             Strategic Verification for <span className="text-emerald-400">{employeeName}</span>
          </p>
        </div>
      </div>

      <div className="p-10 md:p-14 space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-slate-900" />
            Executive Audit Note
          </label>
          <Textarea 
            placeholder="Document performance metrics, adjustment rationale, or specific payroll parameters for this period..."
            className="min-h-[160px] border-slate-200 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 rounded-[1.5rem] bg-slate-50 p-6 text-sm font-medium leading-relaxed transition-all placeholder:text-slate-400"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
           </div>
           <p className="text-[11px] font-bold text-amber-800 leading-relaxed pt-1.5 uppercase tracking-widest">
             <span className="font-black text-amber-950">Security Protocol:</span> Approving this segment will permanently lock all entries and generate an immutable payroll record. Proceed with validated intelligence.
           </p>
        </div>
      </div>

      <div className="px-10 md:px-14 py-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest leading-none">Authentication Ready</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 italic">Awaiting Signature</p>
           </div>
        </div>

        <button 
          onClick={handleApprove}
          disabled={loading}
          className="bg-[#020617] hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs h-16 px-14 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 w-full md:w-auto overflow-hidden group"
        >
          {loading ? (
             'Processing Payroll Seal...'
          ) : (
            <>
              <Send className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Finalize & Release Audit
            </>
          )}
        </button>
      </div>
    </div>
  )
}
