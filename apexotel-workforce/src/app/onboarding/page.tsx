'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Step = 'choose' | 'create' | 'join'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('choose')
  const [companyName, setCompanyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
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
      router.push('/dashboard')
    } catch (err: any) { setError(err.message); setLoading(false) }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data: company, error: cErr } = await supabase.from('companies')
        .select('id, name').eq('id', inviteCode.trim()).single()
      if (cErr || !company) throw new Error('Invalid invite code. Ask your boss for the correct one.')
      const { error: pErr } = await supabase.from('profiles')
        .insert({ id: userId, company_id: company.id, email: userEmail, full_name: userName, role: 'employee' })
      if (pErr) throw pErr
      router.push('/dashboard')
    } catch (err: any) { setError(err.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-10">
          <Image src="/apexotel.png" alt="Apexotel" width={38} height={38} className="object-contain" />
          <span className="text-base font-bold text-slate-900">Apexotel Workforce</span>
        </div>

        {step === 'choose' && (
          <div className="space-y-6 text-center">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {userName.split(' ')[0]}! 👋</h1>
              <p className="mt-2 text-slate-500 text-sm">How would you like to get started?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <button onClick={() => setStep('create')}
                className="bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-400 rounded-2xl p-7 text-left transition-all duration-200 group">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="font-bold text-slate-900 text-base">Create a Workspace</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">I'm a manager setting up my team.</p>
              </button>
              <button onClick={() => setStep('join')}
                className="bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-400 rounded-2xl p-7 text-left transition-all duration-200 group">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="font-bold text-slate-900 text-base">Join a Workspace</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">I have an invite code from my boss.</p>
              </button>
            </div>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-6">
            <button onClick={() => setStep('choose')} className="text-sm text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1">
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Name your Workspace</h1>
              <p className="mt-1 text-slate-500 text-sm">Usually your company or team name.</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
              <input type="text" placeholder="e.g. Apexotel" value={companyName} onChange={e => setCompanyName(e.target.value)} required autoFocus
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition" />
              <button type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition text-sm disabled:opacity-60">
                {loading ? 'Creating...' : '🚀 Create Workspace'}
              </button>
            </form>
          </div>
        )}

        {step === 'join' && (
          <div className="space-y-6">
            <button onClick={() => setStep('choose')} className="text-sm text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1">
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Join a Workspace</h1>
              <p className="mt-1 text-slate-500 text-sm">Paste the Company ID your boss shared with you.</p>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
              <input type="text" placeholder="Paste invite code / Company ID" value={inviteCode} onChange={e => setInviteCode(e.target.value)} required autoFocus
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono transition" />
              <button type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition text-sm disabled:opacity-60">
                {loading ? 'Joining...' : '→ Join Workspace'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
