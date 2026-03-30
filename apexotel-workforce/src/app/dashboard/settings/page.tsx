'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [email, setEmail] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || '')
    })
  }, [supabase])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setSaving(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This action is permanent and cannot be undone.')) return
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="max-w-2xl space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account security and preferences</p>
      </div>

      {/* Account info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Account</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
          <p className="text-sm text-slate-700 font-medium">{email}</p>
          <p className="text-xs text-slate-400">To change your email, contact your administrator.</p>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {message && (
            <div className={`p-3 text-sm rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
              {message.text}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <button type="submit" disabled={saving}
            className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white transition-all disabled:opacity-60">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
        <p className="text-sm text-slate-500">Signing out will end your current session on this device.</p>
        <button
          onClick={handleDeleteAccount}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-all"
        >
          Sign Out of All Devices
        </button>
      </div>
    </div>
  )
}
