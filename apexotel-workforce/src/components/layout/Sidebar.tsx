'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  History,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role: 'boss' | 'employee'
}

export default function Sidebar({ role }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const pathname = usePathname()

  const bossLinks = [
    { name: 'Live Roster', href: '/dashboard/boss', icon: LayoutDashboard },
    { name: 'Team Hub', href: '/dashboard/boss/employees', icon: Users },
    { name: 'Task Board', href: '/dashboard/boss/tasks', icon: CheckSquare },
    { name: 'Daily Logs', href: '/dashboard/boss/logs', icon: ClipboardList },
    { name: 'Timecards', href: '/dashboard/boss/timecards', icon: FileText },
  ]

  const employeeLinks = [
    { name: 'Workspace', href: '/dashboard/employee', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/dashboard/employee/tasks', icon: CheckSquare },
    { name: 'Submit Log', href: '/dashboard/employee/log', icon: ClipboardList },
    { name: 'History', href: '/dashboard/employee/history', icon: History },
  ]

  const links = role === 'boss' ? bossLinks : employeeLinks

  return (
    <div className={cn(
      "hidden md:flex flex-col bg-[#020617] transition-all duration-500 ease-in-out relative z-30 selection:bg-blue-500/30",
      isMinimized ? "w-[88px]" : "w-64"
    )}>
      {/* Premium Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -right-3.5 top-14 h-7 w-7 rounded-full border border-slate-800 bg-[#020617] text-slate-400 hover:text-white hover:border-slate-600 z-50 flex items-center justify-center shadow-2xl transition-all group active:scale-90"
      >
        {isMinimized ? <Plus className="h-3.5 w-3.5 rotate-45" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logo Section */}
      <div className={cn(
        "flex items-center h-20 px-6 shrink-0",
        isMinimized ? "justify-center" : "gap-3"
      )}>
        <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl shrink-0 transition-transform hover:scale-105">
          <Image 
            src="/apexotel.png" 
            alt="Apexotel" 
            width={22} 
            height={22} 
            className="object-contain brightness-0 invert" 
          />
        </div>
        {!isMinimized && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
            <span className="text-sm font-black text-white tracking-tight leading-none">Apexotel</span>
            <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mt-0.5">Workforce</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-hide">
        {/* Main Menu */}
        <div className="space-y-1.5">
          {!isMinimized && (
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
              {role === 'boss' ? 'Management' : 'My Workspace'}
            </p>
          )}
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all group relative duration-300",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon className={cn("shrink-0 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400", isMinimized ? "w-6 h-6 mx-auto" : "w-5 h-5")} />
                {!isMinimized && <span className="animate-in fade-in duration-500">{link.name}</span>}
                {isActive && !isMinimized && (
                   <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50" />
                )}
              </Link>
            )
          })}
        </div>

        {/* System Settings */}
        <div className="space-y-1.5 pt-4 border-t border-white/5">
          {!isMinimized && (
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
              System Settings
            </p>
          )}
          {[
            { name: 'Profile Hub', href: '/dashboard/profile', icon: Users },
            { name: 'System Settings', href: '/dashboard/settings', icon: Settings },
            { name: 'Global Help', href: '/dashboard/help', icon: HelpCircle }
          ].map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all group relative duration-300",
                  isActive
                    ? "bg-slate-800 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon className={cn("shrink-0 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400", isMinimized ? "w-6 h-6 mx-auto" : "w-5 h-5")} />
                {!isMinimized && <span className="animate-in fade-in duration-500">{link.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer / User Badge */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        {!isMinimized ? (
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Version</span>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">2.4.0</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium tracking-tight">Apexotel Workforce OS</p>
          </div>
        ) : (
          <div className="flex justify-center text-slate-700 font-black text-[10px]">V2</div>
        )}
      </div>
    </div>
  )
}
