import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getTodayDateString } from '@/lib/utils/time'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

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

  // 2. Fetch profile for timezone (optional, default to UTC for now)
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', session.user.id)
    .single()

  const workDate = getTodayDateString()

  // 3. Insert new entry
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      employee_id: session.user.id,
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
