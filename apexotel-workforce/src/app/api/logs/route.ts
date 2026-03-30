import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employee_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  let query = supabase.from('daily_logs').select('*')

  if (employeeId) query = query.eq('employee_id', employeeId)
  if (startDate) query = query.gte('log_date', startDate)
  if (endDate) query = query.lte('log_date', endDate)

  const { data, error } = await query.order('log_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json()
  const { log_date, summary, tasks_completed, status } = body

  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({
      employee_id: session.user.id,
      log_date,
      summary,
      tasks_completed,
      status: status || 'submitted',
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
