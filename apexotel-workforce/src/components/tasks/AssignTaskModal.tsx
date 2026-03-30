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
import { ClipboardList, User, Calendar, Flag, Save } from 'lucide-react'

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
      <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-0 border-none shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8">
          <DialogTitle className="text-2xl font-black text-white flex items-center uppercase tracking-tight">
            <ClipboardList className="w-7 h-7 mr-4 text-blue-400" />
            Assign New Task
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-bold tracking-widest uppercase text-[10px] mt-2 italic">
            Delegate responsibilities to your team
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                 <User className="w-3 h-3 mr-2 text-slate-900" />
                 Assign To
               </Label>
               <Select 
                 onValueChange={(v) => setFormData({...formData, assigned_to: v})} 
                 required
               >
                 <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50">
                    <SelectValue placeholder="Select an employee" />
                 </SelectTrigger>
                 <SelectContent className="bg-white rounded-xl shadow-xl">
                   {employees.map(emp => (
                     <SelectItem key={emp.id} value={emp.id} className="font-bold text-slate-700">{emp.full_name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Title</Label>
               <Input 
                 placeholder="e.g. Prepare Quarter Report" 
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 required
                 className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50 focus:ring-slate-300"
               />
             </div>

             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-slate-900">Description</Label>
               <Textarea 
                 placeholder="Provide more details about the task..."
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 className="min-h-[100px] border-slate-200 rounded-xl font-medium bg-slate-50 focus:ring-slate-300 p-4"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                      <Flag className="w-3 h-3 mr-2" />
                      Priority
                   </Label>
                   <Select 
                     value={formData.priority}
                     onValueChange={(v) => setFormData({...formData, priority: v})}
                   >
                     <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-white rounded-xl shadow-xl">
                       <SelectItem value="low" className="font-bold text-blue-600">Low</SelectItem>
                       <SelectItem value="medium" className="font-bold text-amber-600">Medium</SelectItem>
                       <SelectItem value="high" className="font-bold text-red-600">High</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      Due Date
                   </Label>
                   <Input 
                     type="date"
                     value={formData.due_date}
                     onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                     className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50 focus:ring-slate-300"
                   />
                </div>
             </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50">
            <Button 
              type="submit" 
              className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-14 w-full rounded-2xl shadow-lg transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? 'Creating Task...' : (
                <span className="flex items-center">
                  <Save className="w-5 h-5 mr-3 text-blue-400" />
                  Assign Task
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
