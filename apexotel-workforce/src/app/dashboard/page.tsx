import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    // Handle case where profile is not created yet
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Profile not found. Please contact support.</p>
      </div>
    )
  }

  if (profile.role === 'boss') {
    redirect('/dashboard/boss')
  } else {
    redirect('/dashboard/employee')
  }
}
