'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Settings, User } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

interface TopNavProps {
  profile: Profile
}

export default function TopNav({ profile }: TopNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
      {/* Left — greeting */}
      <div className="hidden md:block">
        <p className="text-xs text-slate-400">Welcome back</p>
        <p className="text-sm font-semibold text-slate-900 leading-tight">{profile.full_name}</p>
      </div>
      <p className="text-sm font-semibold text-slate-900 md:hidden">Apexotel</p>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
          profile.role === 'boss'
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {profile.role === 'boss' ? 'Boss' : 'Employee'}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 rounded-full border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-slate-300">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
                <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 rounded-xl border border-slate-200 shadow-lg p-1" align="end">
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{profile.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{profile.role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-1" />
            <DropdownMenuItem className="cursor-pointer rounded-lg text-sm">
              <User className="mr-2 h-4 w-4 text-slate-400" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg text-sm">
              <Settings className="mr-2 h-4 w-4 text-slate-400" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-1" />
            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer rounded-lg text-sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
