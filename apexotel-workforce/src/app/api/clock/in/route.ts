import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getTodayDateString } from '@/lib/utils/time'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { location } = await req.json()

  // 1. Check for existing open entry
  const { data: existing } = await supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', session.user.id)
    .eq('status', 'open')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You are already clocked in.' }, { status: 409 })
  }

  // 2. Fetch profile for company_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile?.company_id) {
    return NextResponse.json({ error: 'User workspace profile not found.' }, { status: 404 })
  }

  const workDate = getTodayDateString()

  // 3. Insert new entry with company_id
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      employee_id: session.user.id,
      company_id: profile.company_id,
      clock_in: new Date().toISOString(),
      work_date: workDate,
      location,
      status: 'open'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
