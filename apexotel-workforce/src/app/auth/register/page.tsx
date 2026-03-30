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
        <div className="text-center space-y-4 max-w-md">
          <div className="text-5xl">📧</div>
          <h2 className="text-2xl font-bold text-slate-900">Check your email!</h2>
          <p className="text-slate-500">We sent a confirmation link to <strong className="text-slate-800">{email}</strong>. Click it to activate your account.</p>
          <Link href="/auth/login" className="inline-block mt-4 text-sm text-slate-400 underline hover:text-slate-700">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col w-[45%] bg-slate-50 border-r border-slate-100 p-14 justify-between">
        <div className="flex items-center gap-3">
          <Image src="/apexotel.png" alt="Apexotel" width={36} height={36} className="object-contain" />
          <span className="text-base font-bold text-slate-900">Apexotel Workforce</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
            Your team's<br />
            <span className="text-slate-400">command center.</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Create a free workspace, invite your team, and start managing work in minutes.
          </p>
          <div className="space-y-3 pt-2">
            {['Real-time clock-in tracking', 'Task assignment & management', 'Payroll-ready timecard exports'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 text-xs font-bold">✓</span>
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400">© 2026 Apexotel</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex lg:hidden items-center gap-3 mb-2">
            <Image src="/apexotel.png" alt="Apexotel" width={32} height={32} className="object-contain" />
            <span className="text-sm font-bold text-slate-900">Apexotel Workforce</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" placeholder="Warren Jacaban" value={fullName} onChange={e => setFullName(e.target.value)} required
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" placeholder="warren@apexotel.com" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-60 mt-2">
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
