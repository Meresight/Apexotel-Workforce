'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Profile } from '@/lib/types/database'
import { ClipboardList, User, Calendar, Flag, Save, Sparkles, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssignTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AssignTaskModal({ open, onOpenChange, onSuccess }: AssignTaskModalProps) {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    assigned_to: '',
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (profile) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', profile.company_id)
          .eq('role', 'employee')
          .order('full_name')
        
        setEmployees(data || [])
      }
    }

    if (open) fetchEmployees()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      onSuccess()
      onOpenChange(false)
      setFormData({
        assigned_to: '',
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      })
    } else {
      alert('Failed to assign task')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden outline-none">
        <div className="bg-[#020617] p-10 relative overflow-hidden">
          {/* Decor */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Sparkles className="w-24 h-24 text-blue-400" />
          </div>
          
          <DialogTitle className="text-2xl font-black text-white flex items-center uppercase tracking-tight relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20">
               <ClipboardList className="w-6 h-6 text-white" />
            </div>
            New Assignment
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px] mt-4 pl-1 relative z-10">
             Strategic Workforce Delegation
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                 <User className="w-3 h-3 text-slate-900" />
                 Target Personnel
               </label>
               <Select 
                 onValueChange={(v) => setFormData({...formData, assigned_to: v})} 
                 required
               >
                 <SelectTrigger className="h-14 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all">
                    <SelectValue placeholder="Select staff member" />
                 </SelectTrigger>
                 <SelectContent className="bg-white rounded-2xl shadow-2xl border-slate-200 p-2">
                   {employees.map(emp => (
                     <SelectItem key={emp.id} value={emp.id} className="font-bold text-xs py-3 rounded-xl">{emp.full_name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Objective Title</label>
               <Input 
                 placeholder="e.g. System Audit Phase 1" 
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 required
                 className="h-14 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
               />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Context / Details</label>
               <Textarea 
                 placeholder="Define task parameters and expectations..."
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 className="min-h-[120px] border-slate-200 rounded-2xl font-medium bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all p-5"
               />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Flag className="w-3 h-3" />
                      Priority
                   </label>
                   <Select 
                     value={formData.priority}
                     onValueChange={(v) => setFormData({...formData, priority: v})}
                   >
                     <SelectTrigger className="h-14 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-white rounded-2xl shadow-2xl border-slate-200 p-2">
                       <SelectItem value="low" className="font-bold text-[10px] uppercase tracking-widest text-blue-600 py-3 rounded-xl cursor-pointer">Low Intensity</SelectItem>
                       <SelectItem value="medium" className="font-bold text-[10px] uppercase tracking-widest text-amber-600 py-3 rounded-xl cursor-pointer">Standard Op</SelectItem>
                       <SelectItem value="high" className="font-bold text-[10px] uppercase tracking-widest text-rose-600 py-3 rounded-xl cursor-pointer">Critical Path</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Deadline
                   </label>
                   <Input 
                     type="date"
                     value={formData.due_date}
                     onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                     className="h-14 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                   />
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
            <button 
              type="submit" 
              className="bg-[#020617] hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs h-16 w-full rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              disabled={loading}
            >
              <Send className="w-4 h-4 text-blue-400" />
              {loading ? 'Transmitting...' : 'Deploy Assignment'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
