import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1. Fetch manager's profile for company_id
  const { data: managerProfile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!managerProfile || managerProfile.role !== 'boss') {
    return NextResponse.json({ error: 'Forbidden. Managers only.' }, { status: 403 })
  }

  const { employee_id, work_date, adjust_in, adjust_out } = await req.json()

  // 2. Security Check: Verify employee belongs to manager's company
  const { data: employeeProfile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', employee_id)
    .single()

  if (!employeeProfile || employeeProfile.company_id !== managerProfile.company_id) {
    return NextResponse.json({ error: 'Employee not found in your workspace.' }, { status: 404 })
  }

  // 3. Find existing entry for this day
  const { data: existing } = await supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', employee_id)
    .eq('work_date', work_date)
    .maybeSingle()

  if (existing) {
    // Update
    const { error } = await supabase
      .from('time_entries')
      .update({
        adjust_in,
        adjust_out
      })
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else {
    // Create new adjustment entry
    const { error } = await supabase
      .from('time_entries')
      .insert({
        company_id: managerProfile.company_id,
        employee_id,
        work_date,
        adjust_in,
        adjust_out,
        status: 'closed' // Auto-close since it's a manager adjustment
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
