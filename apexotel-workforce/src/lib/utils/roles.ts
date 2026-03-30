import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Role } from '@/lib/types/database'

export async function getProfile() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
    
  return profile
}

export async function requireRole(role: Role) {
  const profile = await getProfile()
  if (!profile || profile.role !== role) {
    redirect('/dashboard')
  }
  return profile
}
