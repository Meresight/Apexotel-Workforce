'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/onboarding')
    })
  }, [router, supabase])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
          <p className="text-sm text-slate-500">We sent a confirmation link to <strong className="text-slate-800">{email}</strong>. Click it to continue.</p>
          <Link href="/auth/login" className="inline-block mt-2 text-sm text-slate-400 hover:text-slate-700 underline">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — Image Panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
        <div className="relative z-10 flex flex-col h-full p-12">
          <div className="flex items-center gap-3">
            <Image src="/apexotel.png" alt="Apexotel" width={32} height={32} className="object-contain brightness-0 invert opacity-90" />
            <span className="text-sm font-bold text-white">Apexotel Workforce</span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Built for teams<br />
                <span className="text-slate-400">that mean business.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Create your free workspace in 2 minutes. Manage your entire workforce from day one.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                { icon: '⏱', text: 'Real-time clock-in tracking' },
                { icon: '✅', text: 'Task delegation & monitoring' },
                { icon: '📋', text: 'Daily logs & timecard approvals' },
                { icon: '📊', text: 'Payroll-ready CSV exports' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-sm shrink-0">{f.icon}</div>
                  <span className="text-slate-300 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600">© 2026 Apexotel. All rights reserved.</p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-7">
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <Image src="/apexotel.png" alt="Apexotel" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold text-slate-900">Apexotel Workforce</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">{error}</div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Full Name</label>
              <input type="text" placeholder="Warren Jacaban" value={fullName} onChange={e => setFullName(e.target.value)} required
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all text-sm disabled:opacity-60 mt-1">
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-slate-900 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
