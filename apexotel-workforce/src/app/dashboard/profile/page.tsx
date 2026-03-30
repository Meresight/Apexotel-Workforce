'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, CheckCircle } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setFullName(p.full_name)
        if (p.company_id) {
          const { data: company } = await supabase.from('companies').select('id, name').eq('id', p.company_id).single()
          if (company) { setCompanyName(company.name); setCompanyId(company.id) }
        }
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id)
    setProfile({ ...profile, full_name: fullName })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const copyCompanyId = () => {
    navigator.clipboard.writeText(companyId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = profile?.full_name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  if (loading) return (
    <div className="space-y-5 animate-pulse max-w-2xl">
      <div className="h-8 w-48 bg-slate-100 rounded-lg" />
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar + info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-slate-900 text-white text-lg font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-slate-900">{profile?.full_name}</p>
          <p className="text-sm text-slate-500">{profile?.email}</p>
          <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            profile?.role === 'boss' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {profile?.role === 'boss' ? 'Workspace Boss' : 'Employee'}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full border border-slate-100 bg-slate-50 text-slate-400 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
            />
          </div>
          <button type="submit" disabled={saving}
            className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-700 text-white'} disabled:opacity-60`}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Company info */}
      {companyId && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Workspace</h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Company Name</label>
              <p className="text-sm text-slate-900 font-medium">{companyName}</p>
            </div>
            {profile?.role === 'boss' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Company ID</label>
                <p className="text-xs text-slate-400">Share this with employees so they can join your workspace.</p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                  <code className="flex-1 text-xs text-slate-700 font-mono truncate">{companyId}</code>
                  <button type="button" onClick={copyCompanyId}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
                    {copied ? <><CheckCircle className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
