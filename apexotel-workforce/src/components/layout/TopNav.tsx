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
import { LogOut, Settings, User, Bell, Search, Command, Plus } from 'lucide-react'
import type { Profile } from '@/lib/types/database'
import { Button } from '@/components/ui/button'

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
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left — Search/Context */}
      <div className="flex items-center gap-8 flex-1">
        <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 w-full max-w-sm group transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500/20">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 w-full"
          />
          <div className="flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity">
            <Command className="w-3 h-3" />
            <span className="text-[10px] font-bold">K</span>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-900 md:hidden tracking-tight">Apexotel</p>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Add */}
        <Button variant="outline" className="hidden lg:flex items-center gap-2 border-slate-200 hover:border-slate-900 border-2 rounded-2xl h-11 px-5 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">Quick Task</span>
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-2xl relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 border-2 border-white rounded-full" />
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-100 mx-2 hidden sm:block" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] focus:outline-none group">
              <div className="relative">
                <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-xl group-hover:border-blue-100 transition-colors">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} className="object-cover" />
                  <AvatarFallback className="bg-[#020617] text-white text-[10px] font-black">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
              </div>
              <div className="hidden sm:flex flex-col items-start transition-transform group-hover:translate-x-0.5">
                <p className="text-xs font-black text-slate-900 leading-none">{profile.full_name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {profile.role === 'boss' ? 'Estate Manager' : 'Field Staff'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-[1.5rem] border border-slate-200 shadow-2xl p-2 mt-2 animate-in fade-in slide-in-from-top-4 duration-300" align="end">
            <div className="px-3 py-4 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Active Profile</p>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <Avatar className="h-10 w-10 rounded-xl">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
                  <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-black text-slate-900 leading-none">{profile.full_name}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 truncate max-w-[120px]">{profile.email}</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator className="mx-2 bg-slate-100" />
            <div className="p-1">
              <DropdownMenuItem className="cursor-pointer rounded-xl text-sm font-bold py-3 px-4 focus:bg-slate-50 focus:text-blue-600 transition-colors" onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-3 h-4 w-4 opacity-50" />
                Management Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-xl text-sm font-bold py-3 px-4 focus:bg-slate-50 focus:text-blue-600 transition-colors" onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-3 h-4 w-4 opacity-50" />
                Security Settings
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="mx-2 bg-slate-100" />
            <div className="p-1">
              <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-xl text-sm font-bold py-3 px-4 transition-colors" onClick={handleLogout}>
                <LogOut className="mr-3 h-4 w-4" />
                Terminate Session
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
