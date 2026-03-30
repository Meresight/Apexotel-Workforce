'use client'

import { useState } from 'react'
import TaskBoard from '@/components/tasks/TaskBoard'
import AssignTaskModal from '@/components/tasks/AssignTaskModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function BossTasksPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Task Board</h2>
          <p className="text-slate-500 font-medium italic">Monitor workflows and direct team activities across the company.</p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-14 px-8 rounded-[2rem] shadow-xl transition-all active:scale-95 border-b-4 border-slate-950"
        >
          <Plus className="w-6 h-6 mr-3 text-blue-400 stroke-[3px]" />
          Create Direct Assignment
        </Button>
      </header>

      <TaskBoard />

      <AssignTaskModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        onSuccess={() => {}} // TaskBoard handles its own updates via realtime
      />
    </div>
  )
}
