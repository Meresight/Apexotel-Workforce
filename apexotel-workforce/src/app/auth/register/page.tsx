'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Lock, User, Loader2 } from 'lucide-react'

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-brand-accent/30">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10">
            <Mail className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Check your inbox</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            We've sent a secure confirmation link to <br />
            <strong className="text-slate-900">{email}</strong>. <br />
            Please click it to activate your workspace.
          </p>
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex selection:bg-brand-accent/30">
      {/* Left Panel — Feature Showcase */}
      <div className="hidden lg:flex flex-col w-[45%] bg-[#020817] relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-16 justify-between">
          <div className="space-y-12">
            {/* Logo */}
            <div className="flex items-center gap-4">
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

            {/* Hero Section */}
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                Built for teams that <br />
                <span className="text-white/40">mean excellence.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Create your premium workspace in seconds. Manage operations with enterprise-grade tools.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-5">
              {[
                { icon: CheckCircle2, text: 'Real-time attendance tracking', color: 'text-blue-400' },
                { icon: CheckCircle2, text: 'Advanced task automation', color: 'text-indigo-400' },
                { icon: CheckCircle2, text: 'Secure timecard management', color: 'text-sky-400' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${f.color}`}>
                    <f.icon className="w-4 h-4" />
                  </div>
                  <span className="text-slate-300 font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/5">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2026 Apexotel Technologies</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-[420px] space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Create Account</h2>
            <p className="text-slate-500 font-medium tracking-tight">Set up your personal identity on Apexotel</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-brand-accent">Legal Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-brand-accent" />
                  <input
                    type="text"
                    placeholder="Warren Dave Jacaban"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full h-14 pl-12 pr-6 border border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-brand-accent transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-brand-accent">Professional Email</label>
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-brand-accent">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-brand-accent" />
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full h-14 pl-12 pr-6 border border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-brand-accent transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-14 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-2xl transition-all overflow-hidden disabled:opacity-70 mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create My Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm font-medium">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
