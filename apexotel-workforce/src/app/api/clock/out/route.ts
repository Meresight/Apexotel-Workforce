import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  // 1. Find open entry
  const { data: existing, error: findError } = await supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', session.user.id)
    .eq('status', 'open')
    .maybeSingle()

  if (findError || !existing) {
    return NextResponse.json({ error: 'No active clock-in found.' }, { status: 404 })
  }

  // 2. Update with clock_out - DB trigger sets status to 'closed'
  const { data, error } = await supabase
    .from('time_entries')
    .update({ clock_out: new Date().toISOString() })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
