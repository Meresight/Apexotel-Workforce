import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  // Check if boss
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'boss') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('full_name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
