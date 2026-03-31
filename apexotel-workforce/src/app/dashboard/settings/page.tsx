'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Settings, ShieldCheck, Lock, Mail, AlertTriangle, LogOut, Sparkles, Send, Info, KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [email, setEmail] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || '')
    })
  }, [supabase])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setSaving(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword(''); setConfirmPassword('')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    if (!confirm('Are you sure you want to end your current session?')) return
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 selection:bg-blue-100">
      {/* Premium Settings Header */}
      <div className="bg-[#020617] rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Settings className="w-64 h-64 -translate-y-10 translate-x-10 text-blue-400" />
         </div>
         
         <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
               </div>
               <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">System Security</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest pt-0.5">End-to-End Encryption</span>
               </div>
               <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-md flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pt-0.5">Session Protected</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Account Info & Password Overhaul */}
        <div className="space-y-10">
           {/* Account Context */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/40 space-y-8">
              <div className="flex items-center gap-3 px-2">
                 <Mail className="w-5 h-5 text-blue-600" />
                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 pt-0.5">Account Registry</h3>
                 <div className="h-px flex-1 bg-slate-100 ml-4" />
              </div>

              <div className="space-y-4">
                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Verified Endpoint</p>
                       <p className="text-sm font-black text-slate-900">{email}</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                       <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest italic px-2">
                    Access parameters are managed by your regional administrator.
                 </p>
              </div>
           </div>

           {/* Security Warning Card */}
           <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col justify-center space-y-6 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Info className="w-6 h-6 text-blue-500" />
                 </div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-950 pt-1">Security Directive</h4>
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-md">
                Updating your security credentials will re-initialize your session tokens. Ensure your backup phrase or recovery methods are up-to-date before modification.
              </p>
           </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/40 space-y-10">
           <div className="flex items-center gap-3 px-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 pt-0.5">Credential Update</h3>
              <div className="h-px flex-1 bg-slate-100 ml-4" />
           </div>

           <form onSubmit={handlePasswordChange} className="space-y-8">
              {message && (
                <div className={cn(
                  "p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2",
                  message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-600'
                )}>
                  <div className="flex items-center gap-3">
                     {message.type === 'success' ? <Sparkles className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                     {message.text}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Security Key</label>
                    <Input 
                      type="password" 
                      placeholder="High-entropy string required"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      className="h-14 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all font-mono"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verify Key Sequence</label>
                    <Input 
                      type="password" 
                      placeholder="Repeat sequence for verification"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="h-14 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all font-mono"
                    />
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[#020617] hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 px-10 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-60 flex items-center gap-3"
                >
                  {saving ? 'Transmitting...' : (
                    <><Send className="w-4 h-4 text-blue-400" /> Apply Updated Credentials</>
                  )}
                </button>
              </div>
           </form>
        </div>
      </div>

      {/* Extreme Caution Zone */}
      <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-rose-200/20 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[1.5rem] bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/20">
              <AlertTriangle className="w-8 h-8 text-white" />
           </div>
           <div className="space-y-1">
              <h4 className="text-xl font-black text-rose-950 tracking-tight uppercase">External Session Termination</h4>
              <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest max-w-md">
                 Signing out will clear all local encryption keys and end your active intelligence session immediately.
              </p>
           </div>
        </div>

        <button
          onClick={handleSignOut}
          className="bg-white border-2 border-rose-600 text-rose-600 font-black uppercase tracking-[0.2em] text-[10px] h-16 h-16 px-12 rounded-[1.5rem] hover:bg-rose-600 hover:text-white transition-all active:scale-[0.98] shadow-xl shadow-rose-500/10 flex items-center gap-4 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Terminate Local Access
        </button>
      </div>
    </div>
  )
}
