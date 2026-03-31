'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Copy, CheckCircle, User, ShieldCheck, Mail, Building2, Fingerprint, Sparkles, Send } from 'lucide-react'
import type { Profile } from '@/lib/types/database'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setFullName(p.full_name)
        if (p.company_id) {
          const { data: company } = await supabase.from('companies').select('id, name').eq('id', p.company_id).single()
          if (company) { setCompanyName(company.name); setCompanyId(company.id) }
        }
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id)
    setProfile({ ...profile, full_name: fullName })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const copyCompanyId = () => {
    navigator.clipboard.writeText(companyId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = profile?.full_name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
       <div className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
       <div className="h-[400px] bg-slate-50 rounded-[2.5rem] animate-pulse" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 selection:bg-blue-100">
      {/* Premium Profile Header */}
      <div className="bg-[#020617] rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Fingerprint className="w-64 h-64 -translate-y-10 translate-x-10 text-blue-400" />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
            <div className="relative group">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white/10 ring-4 ring-blue-500/20 shadow-2xl transition-all group-hover:ring-blue-500/40">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-4xl font-black">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl border-4 border-[#020617] group-hover:scale-110 transition-transform">
                 <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="space-y-1">
                 <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">{profile?.full_name}</h1>
                 <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-xs pl-1">{profile?.email}</p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                 <div className={cn(
                   "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md",
                   profile?.role === 'boss' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                 )}>
                    {profile?.role === 'boss' ? 'Administrative Authority' : 'Tactical Personnel'}
                 </div>
                 {companyName && (
                   <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest pt-0.5">{companyName}</span>
                   </div>
                 )}
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Account Details Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-slate-200/40 space-y-10">
           <div className="flex items-center gap-3 px-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 pt-0.5">Core Identification</h3>
              <div className="h-px flex-1 bg-slate-100 ml-4" />
           </div>

           <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Designation</label>
                   <Input 
                     value={fullName}
                     onChange={e => setFullName(e.target.value)}
                     className="h-14 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verified Protocol</label>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input 
                        value={profile?.email || ''}
                        disabled
                        className="h-14 pl-12 border-slate-200 rounded-2xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-inner"
                      />
                   </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className={cn(
                    "flex items-center gap-3 px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl",
                    saved ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-[#020617] hover:bg-slate-900 text-white shadow-slate-200'
                  )}
                >
                  {saving ? 'Synchronizing...' : saved ? (
                    <><CheckCircle className="w-4 h-4" /> Identification Updated</>
                  ) : (
                    <><Send className="w-4 h-4 text-blue-400" /> Save Profile Details</>
                  )}
                </button>
              </div>
           </form>
        </div>

        {/* Global Access / Company Section */}
        <div className="space-y-10">
          {companyId && (
            <div className="bg-[#020617] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5 text-white">
                  <Building2 className="w-32 h-32" />
               </div>
               
               <div className="relative z-10 space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Operational Workspace</h4>
                    <div className="space-y-1.5 group">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Entity Name</p>
                       <p className="text-xl font-black text-white tracking-tight">{companyName}</p>
                    </div>
                  </div>

                  {profile?.role === 'boss' && (
                    <div className="space-y-6 pt-6 border-t border-white/10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Workspace Credentials</label>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest italic mb-4">
                          Secure entry key for personnel on-boarding.
                        </p>
                        
                        <div className="relative flex items-center gap-3">
                           <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 h-16 flex items-center shadow-inner overflow-hidden">
                              <code className="text-xs text-blue-300 font-mono tracking-wider truncate uppercase">{companyId}</code>
                           </div>
                           <button 
                             onClick={copyCompanyId}
                             className={cn(
                               "w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl",
                               copied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                             )}
                           >
                             {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {profile?.role !== 'boss' && (
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                          Security Status
                       </p>
                       <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest italic">
                          Your profile is authenticated through <span className="text-white">{companyName}</span> active intelligence registry.
                       </p>
                    </div>
                  )}
               </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
             <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-slate-300" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocol Version</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Apexotel v2.4.0 High-End</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
