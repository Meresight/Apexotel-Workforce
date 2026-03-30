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
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      // Check if profile exists
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile) router.push('/dashboard')
      else router.push('/onboarding')
    }
    check()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError(loginError.message)
      setLoading(false)
    } else {
      // Check profile after login
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (profile) router.push('/dashboard')
        else router.push('/onboarding')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — Image Panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-950 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/apexotel.png" alt="Apexotel" width={32} height={32} className="object-contain brightness-0 invert opacity-90" />
            <span className="text-sm font-bold text-white">Apexotel Workforce</span>
          </div>

          {/* Dashboard mockup image in middle */}
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 backdrop-blur">
                <div className="bg-white/5 border-b border-white/10 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60"></div>
                  </div>
                  <div className="flex-1 mx-3 bg-white/5 rounded h-4"></div>
                </div>
                <Image
                  src="/dashboard_preview.png"
                  alt="Dashboard Preview"
                  width={800}
                  height={500}
                  className="w-full object-cover opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="space-y-3">
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              "From clock-ins to approvals — everything your team needs in one place."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-700"></div>
              <div>
                <p className="text-white text-xs font-semibold">Apexotel Team</p>
                <p className="text-slate-500 text-xs">Workforce Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <Image src="/apexotel.png" alt="Apexotel" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold text-slate-900">Apexotel Workforce</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all text-sm disabled:opacity-60 mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-slate-900 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
