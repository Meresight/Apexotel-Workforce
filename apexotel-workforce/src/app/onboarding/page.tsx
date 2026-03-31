'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Copy, CheckCircle, ArrowRight, Building2, Users2, ChevronLeft, Loader2, Sparkles } from 'lucide-react'

type Step = 'choose' | 'create' | 'join'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('choose')
  const [companyName, setCompanyName] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single()
      if (profile) { router.push('/dashboard'); return }
      
      setUserId(session.user.id)
      setUserEmail(session.user.email || '')
      setUserName(session.user.user_metadata?.full_name || 'there')

      setIsInitialLoading(false)

      const params = new URLSearchParams(window.location.search)
      const invId = params.get('company_id')
      if (invId) {
        setCompanyId(invId)
        setStep('join')
      }
    }
    load()
  }, [router, supabase])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data: company, error: cErr } = await supabase.from('companies')
        .insert({ name: companyName, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
        .select().single()
      if (cErr) throw cErr

      const { error: pErr } = await supabase.from('profiles')
        .upsert({ id: userId, company_id: company.id, email: userEmail, full_name: userName, role: 'boss' })
      if (pErr) throw pErr

      setCreatedCompanyId(company.id)
    } catch (err: any) { setError(err.message); setLoading(false) }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data: company, error: cErr } = await supabase.from('companies').select('id, name').eq('id', companyId.trim()).single()
      if (cErr || !company) throw new Error('Invalid Company ID. Ask your boss to shared their Company ID.')

      const { error: pErr } = await supabase.from('profiles')
        .upsert({ id: userId, company_id: company.id, email: userEmail, full_name: userName, role: 'employee' })
      if (pErr) throw pErr

      router.push('/dashboard')
    } catch (err: any) { setError(err.message); setLoading(false) }
  }

  const copyId = () => {
    if (createdCompanyId) {
      navigator.clipboard.writeText(createdCompanyId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
          <div className="relative w-16 h-16 flex items-center justify-center rounded-3xl bg-slate-50 border border-slate-100 shadow-xl overflow-hidden group">
            <div className="absolute inset-0 bg-slate-900 group-hover:opacity-100 opacity-5 transition-opacity duration-500" />
            <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Establishing Session...</p>
        </div>
      </div>
    )
  }

  if (createdCompanyId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-100">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-10 text-center shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 className="w-32 h-32 text-slate-900" />
          </div>
          <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/10">
            <Sparkles className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Workspace Created!</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Your management hub is ready. Invite your team <br />
            by sharing the unique Company ID below.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 mb-10 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secret Company ID</p>
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-2 pl-6">
              <code className="flex-1 text-sm text-slate-900 font-mono font-bold truncate leading-none pt-1">
                {createdCompanyId}
              </code>
              <button 
                onClick={copyId} 
                className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all ${
                  copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-0' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {copied ? <CheckCircle className="w-5 h-5 animate-in zoom-in duration-300" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Employees must use this ID when they join Apexotel.</p>
          </div>

          <button 
            onClick={() => router.push('/dashboard')} 
            className="group w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm"
          >
            Enter Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex selection:bg-blue-100">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col w-[40%] bg-[#020817] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#020817] to-indigo-900/10" />
        <div className="relative z-10 flex flex-col h-full p-16 justify-between">
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <Image src="/apexotel.png" alt="Apexotel" width={32} height={32} className="object-contain brightness-0 invert" />
              </div>
              <p className="text-xl font-bold text-white tracking-tight">Apexotel <span className="text-blue-400/80 font-medium">Workforce</span></p>
            </div>

            <div className="space-y-6 pt-12">
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                One last step<br />
                <span className="text-white/30 tracking-tight">for your workspace.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xs">
                To start tracking and managing, you need to belong to a workspace.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold">Managers</p>
                  <p className="text-slate-400 text-sm leading-snug">Create a fresh workspace for your team and set up your hierarchy.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm opacity-60">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Users2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold">Staff</p>
                  <p className="text-slate-400 text-sm leading-snug">Join an existing workspace using a Company ID shared by your manager.</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em]">© 2026 Apexotel Platforms</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/50 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <Image src="/apexotel.png" alt="Apexotel" width={32} height={32} className="object-contain" />
            <span className="text-lg font-black text-slate-900 tracking-tight">Apexotel</span>
          </div>

          {step === 'choose' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-950 tracking-tight">Welcome, {userName.split(' ')[0]}!</h1>
                <p className="text-slate-500 font-medium text-lg">Pick how you want to start your session.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <button 
                  onClick={() => setStep('create')}
                  className="group relative flex flex-col items-start gap-4 bg-white border border-slate-200 p-8 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <Building2 className="w-32 h-32 text-slate-900" />
                  </div>
                  <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/5">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-xl font-black text-slate-900 tracking-tight">Create a Workspace</p>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">Setup a new organizational unit for your hotel and invite employees.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-slate-100 mt-2 flex items-center justify-center transition-all group-hover:bg-slate-900 group-hover:text-white">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button 
                  onClick={() => setStep('join')}
                  className="group relative flex flex-col items-start gap-4 bg-white border border-slate-200 p-8 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <Users2 className="w-32 h-32 text-slate-900" />
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-indigo-500/5">
                    <Users2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-xl font-black text-slate-900 tracking-tight">Join a Workspace</p>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">Connect to an active hotel workspace using an invite from your manager.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-slate-100 mt-2 flex items-center justify-center transition-all group-hover:bg-slate-900 group-hover:text-white">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <button 
                onClick={() => setStep('choose')} 
                className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest pl-1"
              >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Go Back
              </button>
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-950 tracking-tight">Name Workspace</h1>
                <p className="text-slate-500 font-medium text-lg leading-tight">Usually your Hotel or Branch name.</p>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                {error && (
                  <div className="p-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace Identity</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apexotel Makati Central" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    required 
                    autoFocus
                    className="w-full h-16 px-8 border border-slate-200 bg-white text-slate-950 placeholder:text-slate-300 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-lg shadow-sm" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="group w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/50" /> : (
                    <>
                      Confirm & Create
                      <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'join' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <button 
                onClick={() => setStep('choose')} 
                className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest pl-1"
              >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Go Back
              </button>
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-950 tracking-tight">Identity Hub</h1>
                <p className="text-slate-500 font-medium text-lg leading-tight">Paste the Company ID shared by manager.</p>
              </div>

              <form onSubmit={handleJoin} className="space-y-8">
                {error && (
                  <div className="p-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace ID</label>
                  <input 
                    type="text" 
                    placeholder="3f8a1b2c-9d4e-..." 
                    value={companyId} 
                    onChange={e => setCompanyId(e.target.value)} 
                    required 
                    autoFocus
                    className="w-full h-16 px-8 border border-slate-200 bg-white text-slate-950 placeholder:text-slate-300 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono font-bold text-md shadow-sm" 
                  />
                  <p className="text-[10px] text-slate-400 font-medium px-1 leading-relaxed">Ask your manager for the Workspace Key in their dashboard settings profile area.</p>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="group w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/50" /> : (
                    <>
                      Verify & Join
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
