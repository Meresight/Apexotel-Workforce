import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { calculateDecimalHours } from '@/lib/utils/time'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  // Check if boss
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'boss') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { employee_id, period_start, period_end, boss_note } = await req.json()

  // 1. Fetch all closed time entries in the period
  const { data: entries, error: entriesError } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employee_id)
    .gte('work_date', period_start)
    .lte('work_date', period_end)
    .eq('status', 'closed')

  if (entriesError) return NextResponse.json({ error: entriesError.message }, { status: 400 })

  // 2. Calculate totals
  let totalHours = 0
  let regularHours = 0
  let overtimeHours = 0

  entries.forEach(entry => {
    if (entry.clock_in && entry.clock_out) {
      const hours = calculateDecimalHours(entry.clock_in, entry.clock_out)
      totalHours += hours
      const reg = Math.min(hours, 8)
      regularHours += reg
      overtimeHours += Math.max(hours - 8, 0)
    }
  })

  // 3. Update entries to approved
  const { error: updateError } = await supabase
    .from('time_entries')
    .update({ status: 'approved' })
    .eq('employee_id', employee_id)
    .gte('work_date', period_start)
    .lte('work_date', period_end)
    .eq('status', 'closed')

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

  // 4. Upsert timecard
  const { data, error } = await supabase
    .from('timecards')
    .insert({
      employee_id,
      period_start,
      period_end,
      total_hours: totalHours,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      status: 'approved',
      boss_note,
      approved_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
