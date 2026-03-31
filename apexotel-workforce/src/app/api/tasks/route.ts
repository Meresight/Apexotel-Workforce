import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  // Fetch profile for company_id isolation
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', session.user.id)
    .single()

  if (!profile?.company_id) return new NextResponse('Forbidden', { status: 403 })

  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employee_id')

  let query = supabase.from('tasks').select('*')
    .eq('company_id', profile.company_id)
  
  if (employeeId) {
    query = query.eq('assigned_to', employeeId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
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

  const body = await req.json()
  const { assigned_to, title, description, priority, due_date } = body

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      company_id: profile.company_id,
      assigned_to,
      assigned_by: session.user.id,
      title,
      description,
      priority,
      due_date,
      status: 'pending'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data, { status: 201 })
}
