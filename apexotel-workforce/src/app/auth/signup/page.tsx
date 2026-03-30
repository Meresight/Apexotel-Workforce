'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [session, setSession] = useState<any>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession) {
        setIsExistingUser(true)
        setSession(currentSession)
        setEmail(currentSession.user.email || '')
      }
    }
    checkSession()
  }, [supabase])

  const invitedCompanyId = searchParams.get('company_id')
  const invitedRole = searchParams.get('role') || 'employee'
  const isEmployeeSignup = !!invitedCompanyId

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let finalCompanyId = invitedCompanyId
      let finalRole = invitedRole

      // 1. If boss, create company first to get the ID
      if (!isEmployeeSignup) {
        finalRole = 'boss'
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({ name: companyName, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
          .select()
          .single()

        if (companyError) throw companyError
        finalCompanyId = companyData.id
      }

      if (isExistingUser && session) {
        // 2a. Direct profile insert for already logged-in users
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            company_id: finalCompanyId,
            full_name: fullName,
            email: email,
            role: finalRole,
          })
        
        if (profileError) {
          // If profile already exists, just redirect
          if (profileError.code === '23505') {
            router.push('/dashboard')
            return
          }
          throw profileError
        }
      } else {
        // 2b. Auth Signup for new users
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: finalRole,
              company_id: finalCompanyId,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Signup failed')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 text-center">
            {isExistingUser ? 'Complete Your Profile' : 'Apexotel Workforce'}
          </CardTitle>
          <CardDescription className="text-center">
            {isExistingUser 
              ? 'Finish setting up your account to access the dashboard' 
              : (isEmployeeSignup ? `Join as ${invitedRole}` : 'Create your company account')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-slate-300 focus:ring-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isExistingUser}
                className="border-slate-300 focus:ring-slate-400 disabled:opacity-70"
              />
            </div>
            {!isEmployeeSignup && (
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-slate-700">Company Name</label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Apexotel"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="border-slate-300 focus:ring-slate-400"
                />
              </div>
            )}
            {!isExistingUser && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-slate-300 focus:ring-slate-400"
                />
              </div>
            )}
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={loading}>
              {loading ? (isExistingUser ? 'Saving...' : 'Creating account...') : (isExistingUser ? 'Finish Setup' : 'Create Account')}
            </Button>
          </form>
        </CardContent>
        {!isExistingUser && (
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-slate-500 text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-slate-900 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
