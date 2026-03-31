import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  // 1. Fetch user profile for isolation
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', session.user.id)
    .single()

  if (!profile?.company_id) return new NextResponse('Forbidden', { status: 403 })

  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employee_id')
  const periodStart = searchParams.get('period_start')
  const periodEnd = searchParams.get('period_end')

  // 2. Build query with company isolation
  let query = supabase.from('timecards').select('*')

  if (profile.role === 'boss') {
    // Managers see company timecards (filtered by employee_id if provided)
    if (employeeId) {
      // Security Check: Verify employee belongs to manager's company
      const { data: empProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', employeeId)
        .single()
      
      if (!empProfile || empProfile.company_id !== profile.company_id) {
        return NextResponse.json({ error: 'Employee not found in your workspace.' }, { status: 404 })
      }
      query = query.eq('employee_id', employeeId)
    } else {
      // Find all employees in company and filter timecards
      const { data: employees } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', profile.company_id)
      
      const ids = employees?.map(e => e.id) || []
      query = query.in('employee_id', ids)
    }
  } else {
    // Employees only see their own
    query = query.eq('employee_id', session.user.id)
  }

  if (periodStart) query = query.gte('period_start', periodStart)
  if (periodEnd) query = query.lte('period_end', periodEnd)

  const { data, error } = await query.order('period_start', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
