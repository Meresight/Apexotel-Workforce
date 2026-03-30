import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center space-y-6">
          <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">👋</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Finish Setting Up</h1>
            <p className="text-slate-500">We found your account, but we need a few more details to set up your workspace.</p>
          </div>
          <div className="pt-4">
            <a 
              href="/auth/signup" 
              className="inline-block w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Complete Profile Setup
            </a>
          </div>
          <p className="text-xs text-slate-400 italic">User ID: {session.user.id}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role={profile.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
