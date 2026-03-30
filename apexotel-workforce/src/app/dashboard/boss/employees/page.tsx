'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Copy, CheckCircle2, Mail, Users, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/types/database'

export default function BossEmployeesPage() {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bossProfile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()
      if (!bossProfile) return

      const host = typeof window !== 'undefined' ? window.location.origin : ''
      setInviteUrl(`${host}/onboarding?company_id=${bossProfile.company_id}`)

      const { data } = await supabase.from('profiles').select('*').eq('company_id', bossProfile.company_id).eq('role', 'employee').order('full_name')
      setEmployees(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and invite your workforce members</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 rounded-xl h-9">
              + Invite Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-500" />
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Share this link with employees so they can join your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Input className="bg-transparent border-none text-xs text-slate-600 focus-visible:ring-0 truncate p-0 h-auto" value={inviteUrl} readOnly />
              </div>
              <Button onClick={copyToClipboard} className={`w-full font-semibold text-sm transition-all rounded-xl ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-700'}`}>
                {copied ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Invite Link</>}
              </Button>
              <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Employees use this link to join your company
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Employee</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Email</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Joined</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3].map(i => (
                <tr key={i} className="border-b border-slate-50">
                  <td colSpan={4} className="px-6 py-4">
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
            ) : employees.length > 0 ? employees.map(emp => (
              <tr key={emp.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={emp.avatar_url || ''} />
                      <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">
                        {emp.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{emp.full_name}</p>
                      <p className="text-xs text-slate-400">Employee</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{emp.email}</td>
                <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">{new Date(emp.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-700">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No employees yet</p>
                  <p className="text-xs text-slate-300 mt-1">Click "Invite Employee" to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
