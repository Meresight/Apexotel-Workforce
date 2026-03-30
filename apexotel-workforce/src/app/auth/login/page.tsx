'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col w-[45%] bg-slate-50 border-r border-slate-100 p-14 justify-between">
        <div className="flex items-center gap-3">
          <Image src="/apexotel.png" alt="Apexotel" width={36} height={36} className="object-contain" />
          <span className="text-base font-bold text-slate-900">Apexotel Workforce</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
            Welcome<br />
            <span className="text-slate-400">back.</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your team is waiting. Sign in to see the live roster, check tasks, and keep everything running smoothly.
          </p>
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
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" placeholder="warren@apexotel.com" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-60 mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-slate-900 font-semibold hover:underline">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
