'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Copy, CheckCircle } from 'lucide-react'

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

      // Handle invite link pre-fill
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
        .insert({ id: userId, company_id: company.id, email: userEmail, full_name: userName, role: 'boss' })
      if (pErr) throw pErr

      setCreatedCompanyId(company.id)
    } catch (err: any) { setError(err.message); setLoading(false) }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data: company, error: cErr } = await supabase.from('companies').select('id, name').eq('id', companyId.trim()).single()
      if (cErr || !company) throw new Error('Invalid Company ID. Ask your boss to share their Company ID from the dashboard.')

      const { error: pErr } = await supabase.from('profiles')
        .insert({ id: userId, company_id: company.id, email: userEmail, full_name: userName, role: 'employee' })
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

  // Show invite screen after workspace creation
  if (createdCompanyId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2.5 justify-center">
            <Image src="/apexotel.png" alt="Apexotel" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold text-slate-900">Apexotel Workforce</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-lg font-bold text-slate-900">Workspace Created!</h2>
            <p className="text-sm text-slate-500 mt-1">Share your Company ID with employees so they can join.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Company ID</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <code className="flex-1 text-sm text-slate-700 font-mono truncate">{createdCompanyId}</code>
              <button onClick={copyId} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">Employees paste this when joining at <span className="font-mono">/auth/register</span> → "Join a Workspace"</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all text-sm">
            Go to Dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
        <div className="relative z-10 flex flex-col h-full p-12">
          <div className="flex items-center gap-3">
            <Image src="/apexotel.png" alt="Apexotel" width={32} height={32} className="object-contain brightness-0 invert opacity-90" />
            <span className="text-sm font-bold text-white">Apexotel Workforce</span>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              One more step<br />
              <span className="text-slate-400">to your workspace.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Create a new workspace if you're a manager, or join an existing one with a Company ID from your boss.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">🏢</span>
                <div>
                  <p className="text-white text-sm font-semibold">Create</p>
                  <p className="text-slate-400 text-xs">You're a boss. Your workspace, your rules.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🤝</span>
                <div>
                  <p className="text-white text-sm font-semibold">Join</p>
                  <p className="text-slate-400 text-xs">You have a Company ID from your manager.</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600">© 2026 Apexotel</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <Image src="/apexotel.png" alt="Apexotel" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold text-slate-900">Apexotel Workforce</span>
          </div>

          {step === 'choose' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {userName.split(' ')[0]}! 👋</h1>
                <p className="text-sm text-slate-500 mt-1">How would you like to get started?</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => setStep('create')}
                  className="w-full flex items-center gap-4 bg-white border-2 border-slate-200 hover:border-slate-900 rounded-2xl p-5 text-left transition-all group">
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-slate-900 rounded-xl flex items-center justify-center transition-all shrink-0">
                    <span className="text-lg">🏢</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Create a Workspace</p>
                    <p className="text-slate-400 text-xs mt-0.5">I'm a manager setting up my team</p>
                  </div>
                </button>
                <button onClick={() => setStep('join')}
                  className="w-full flex items-center gap-4 bg-white border-2 border-slate-200 hover:border-slate-900 rounded-2xl p-5 text-left transition-all group">
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-slate-900 rounded-xl flex items-center justify-center transition-all shrink-0">
                    <span className="text-lg">🤝</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Join a Workspace</p>
                    <p className="text-slate-400 text-xs mt-0.5">I have a Company ID from my boss</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <div className="space-y-6">
              <button onClick={() => setStep('choose')} className="text-sm text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">← Back</button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Name your Workspace</h1>
                <p className="text-sm text-slate-500 mt-1">Usually your company or team name.</p>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}
                <input type="text" placeholder="e.g. Apexotel" value={companyName} onChange={e => setCompanyName(e.target.value)} required autoFocus
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" />
                <button type="submit" disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all text-sm disabled:opacity-60">
                  {loading ? 'Creating...' : '🚀 Create Workspace'}
                </button>
              </form>
            </div>
          )}

          {step === 'join' && (
            <div className="space-y-6">
              <button onClick={() => setStep('choose')} className="text-sm text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">← Back</button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Join a Workspace</h1>
                <p className="text-sm text-slate-500 mt-1">Paste the Company ID your boss shared with you.</p>
              </div>
              <form onSubmit={handleJoin} className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}
                <div>
                  <input type="text" placeholder="e.g. 3f8a1b2c-..." value={companyId} onChange={e => setCompanyId(e.target.value)} required autoFocus
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono transition-all" />
                  <p className="text-xs text-slate-400 mt-1.5">Ask your boss for their Company ID from the dashboard settings.</p>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all text-sm disabled:opacity-60">
                  {loading ? 'Joining...' : '→ Join Workspace'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
