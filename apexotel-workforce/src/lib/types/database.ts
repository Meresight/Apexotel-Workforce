export type Role = 'boss' | 'employee'
export type TimeEntryStatus = 'open' | 'closed' | 'approved' | 'flagged'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high'
export type LogStatus = 'draft' | 'submitted' | 'reviewed'
export type TimecardStatus = 'draft' | 'submitted' | 'approved' | 'disputed'

export interface Company {
  id: string
  name: string
  timezone: string
  created_at: string
}

export interface Profile {
  id: string
  company_id: string
  full_name: string
  email: string
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface TimeEntry {
  id: string
  company_id: string
  employee_id: string
  clock_in: string
  clock_out: string | null
  work_date: string
  location: string | null
  status: TimeEntryStatus
  notes: string | null
  adjust_in: string | null
  adjust_out: string | null
  created_at: string
}

export interface DailyLog {
  id: string
  company_id: string
  employee_id: string
  log_date: string
  summary: string
  tasks_completed: string[]
  status: LogStatus
  boss_note: string | null
  submitted_at: string | null
  created_at: string
}

export interface Task {
  id: string
  company_id: string
  assigned_to: string
  assigned_by: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Timecard {
  id: string
  employee_id: string
  period_start: string
  period_end: string
  total_hours: number
  regular_hours: number
  overtime_hours: number
  status: TimecardStatus
  boss_note: string | null
  approved_at: string | null
  created_at: string
}
