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
  Settings
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
    { name: 'Team', href: '/dashboard/boss/employees', icon: Users },
    { name: 'Tasks', href: '/dashboard/boss/tasks', icon: CheckSquare },
    { name: 'Daily Logs', href: '/dashboard/boss/logs', icon: ClipboardList },
    { name: 'Timecards', href: '/dashboard/boss/timecards', icon: FileText },
  ]

  const employeeLinks = [
    { name: 'Dashboard', href: '/dashboard/employee', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/dashboard/employee/tasks', icon: CheckSquare },
    { name: 'Submit Log', href: '/dashboard/employee/log', icon: ClipboardList },
    { name: 'History', href: '/dashboard/employee/history', icon: History },
  ]

  const links = role === 'boss' ? bossLinks : employeeLinks

  return (
    <div className={cn(
      "hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out relative",
      isMinimized ? "w-[68px]" : "w-56"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -right-3 top-[72px] h-6 w-6 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 z-50 flex items-center justify-center shadow-sm transition-all"
      >
        {isMinimized ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-slate-100 h-16 px-4 shrink-0",
        isMinimized ? "justify-center" : "gap-2.5"
      )}>
        <Image src="/apexotel.png" alt="Apexotel" width={28} height={28} className="object-contain shrink-0" />
        {!isMinimized && (
          <span className="text-sm font-bold text-slate-900 truncate">Apexotel</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {!isMinimized && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
            {role === 'boss' ? 'Management' : 'My Workspace'}
          </p>
        )}
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              title={isMinimized ? link.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group relative",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <link.icon className={cn("shrink-0", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-700", isMinimized ? "w-5 h-5 mx-auto" : "w-4 h-4")} />
              {!isMinimized && <span>{link.name}</span>}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-4 border-t border-slate-50" />

        {/* System Links */}
        {!isMinimized && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pb-1">
            System
          </p>
        )}
        {[
          { name: 'Profile', href: '/dashboard/profile', icon: Users },
          { name: 'Settings', href: '/dashboard/settings', icon: Settings }
        ].map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              title={isMinimized ? link.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group relative",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("shrink-0", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-700", isMinimized ? "w-5 h-5 mx-auto" : "w-4 h-4")} />
              {!isMinimized && <span>{link.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isMinimized && (
        <div className="p-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 tracking-tight font-medium outline-none">Apexotel Workforce v1.1</p>
        </div>
      )}
    </div>
  )
}
