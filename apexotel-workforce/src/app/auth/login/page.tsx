'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react'

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
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (profile) router.push('/dashboard')
        else router.push('/onboarding')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex selection:bg-brand-accent/30">
      {/* Left Panel — Brand & Experience */}
      <div className="hidden lg:flex flex-col w-[45%] bg-[#020817] relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-16 justify-between">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <Image 
                  src="/apexotel.png" 
                  alt="Apexotel" 
                  width={32} 
                  height={32} 
                  className="object-contain brightness-0 invert" 
                />
              </div>
              <div>
                <p className="text-xl font-bold text-white tracking-tight leading-none">Apexotel</p>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-[0.2em] mt-1">Workforce</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-6 pt-12">
              <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                Empower your <br />
                <span className="text-white/40">workforce</span> with <br />
                precision.
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                The ultimate platform for modern hotel management. Streamline attendance, tasks, and team coordination in one premium workspace.
              </p>
            </div>
          </div>

          {/* Social Proof/Capabilities */}
          <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-12">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-slate-500 text-sm">Real-time sync</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-slate-500 text-sm">Automated tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Secure Access */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-[420px] space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Access Workspace</h2>
            <p className="text-slate-500 font-medium tracking-tight">Sign in with your organization credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-brand-accent">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-brand-accent" />
                  <input
                    type="email"
                    placeholder="name@organization.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full h-14 pl-12 pr-6 border border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-brand-accent transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-brand-accent">Password</label>
                  <Link href="/auth/reset" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-brand-accent" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full h-14 pl-12 pr-6 border border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-brand-accent transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-14 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-2xl transition-all overflow-hidden disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In Workspace
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center">
            <p className="text-slate-500 text-sm font-medium">
              New to Apexotel?{' '}
              <Link href="/auth/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
