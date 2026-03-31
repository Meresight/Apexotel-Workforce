'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Copy, CheckCircle2, Mail, Users, ExternalLink, Search, UserPlus, MoreHorizontal, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/types/database'
import { cn } from '@/lib/utils'

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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 selection:bg-blue-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-3xl font-black text-slate-950 tracking-tight">Team Hub</h1>
          </div>
          <p className="text-slate-500 font-medium pl-1">Manage and scale your workforce infrastructure.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button className="group relative flex items-center gap-2 bg-[#020617] hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl shadow-slate-200">
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Invite Associate
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10 outline-none">
            <DialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/5">
                 <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight">
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium leading-relaxed">
                Provide this secure onboarding link to new employees. Once they sign in, they will automatically join your company structure.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Onboarding Link</label>
                <div className="group relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus-within:bg-white focus-within:border-blue-500/30 transition-all">
                  <Input 
                    className="bg-transparent border-none text-sm text-slate-900 font-bold focus-visible:ring-0 truncate p-0 h-auto" 
                    value={inviteUrl} 
                    readOnly 
                  />
                  <div className="absolute right-4 px-2 py-0.5 bg-slate-200 text-[9px] font-black text-slate-500 rounded uppercase tracking-widest opacity-40 group-focus-within:opacity-0 transition-opacity">Private</div>
                </div>
              </div>
              
              <button 
                onClick={copyToClipboard} 
                className={cn(
                  "w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg",
                  copied ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-[#020617] text-white shadow-slate-200"
                )}
              >
                {copied ? <CheckCircle2 className="w-5 h-5 animate-in zoom-in" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Link Copied' : 'Copy Enterprise Link'}
              </button>
              
              <div className="flex items-center gap-2 p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-700 font-bold leading-snug">This link contains your unique Company ID. Do not share it publicly.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Workforce Directory</h2>
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find staff..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all w-48"
              />
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-8 py-5">Personnel Associate</th>
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-8 py-5 hidden md:table-cell">Enterprise Credentials</th>
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-8 py-5 hidden lg:table-cell">Activation Date</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6">
                      <div className="h-12 bg-slate-50 rounded-2xl w-full" />
                    </td>
                  </tr>
                ))
              ) : employees.length > 0 ? employees.map(emp => (
                <tr key={emp.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-xl group-hover:scale-105 transition-transform">
                          <AvatarImage src={emp.avatar_url || ''} className="object-cover" />
                          <AvatarFallback className="bg-[#020617] text-white text-[10px] font-black">
                            {emp.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-950 tracking-tight leading-tight">{emp.full_name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                           <ShieldCheck className="w-3 h-3 text-slate-300" />
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Staff</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <p className="text-[11px] font-bold text-slate-900 tracking-tight">{emp.email}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mt-1">Authorized Access</p>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell">
                    <p className="text-[11px] font-bold text-slate-500 tracking-tight">{new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-90 text-slate-300 hover:text-slate-900">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-100/50">
                       <Users className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-950 tracking-tight">Enterprise Void</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2 leading-relaxed">Your roster is currently empty. Use the invitation portal above to start building your team.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
