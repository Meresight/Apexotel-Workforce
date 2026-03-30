import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col overflow-x-hidden">

      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-6 md:px-20 py-4">
        <div className="flex items-center gap-3">
          <Image src="/apexotel.png" alt="Apexotel" width={34} height={34} className="object-contain" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">Apexotel Workforce</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login"
            className="text-sm text-slate-500 hover:text-slate-900 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-all">
            Sign In
          </Link>
          <Link href="/auth/register"
            className="text-sm bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-700 transition-all shadow-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-xs text-emerald-700 font-semibold mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Now live for Apexotel teams
        </div>

        <h1 className="text-5xl md:text-[72px] font-extrabold tracking-tight text-slate-900 leading-[1.04] mb-6">
          Run your workforce
          <br className="hidden md:block" />
          <span className="text-slate-300">without the chaos.</span>
        </h1>

        <p className="text-lg text-slate-500 max-w-lg leading-relaxed mb-10">
          Time tracking, task management, daily logs, and timecard approval — all in one clean, fast workspace for your entire team.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/auth/register"
            className="bg-slate-900 text-white font-bold text-sm px-8 py-4 rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/10">
            Create Your Workspace →
          </Link>
          <Link href="/auth/login"
            className="bg-white text-slate-600 font-medium text-sm px-8 py-4 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all">
            Sign In
          </Link>
        </div>
      </section>

      {/* Dashboard Mock Preview */}
      <section className="px-6 md:px-16 pb-16 max-w-5xl mx-auto w-full">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60">
          {/* Fake browser bar */}
          <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
              <div className="w-3 h-3 rounded-full bg-green-300"></div>
            </div>
            <div className="flex-1 mx-4 bg-slate-100 rounded-md h-6 flex items-center px-3">
              <span className="text-xs text-slate-400">workforce.apexotel.com/dashboard</span>
            </div>
          </div>
          {/* Fake Dashboard */}
          <div className="flex min-h-[320px] md:min-h-[400px]">
            {/* Sidebar */}
            <div className="w-16 md:w-52 bg-slate-900 flex flex-col p-3 md:p-4 gap-1 shrink-0">
              <div className="flex items-center gap-2 mb-5 px-1">
                <Image src="/apexotel.png" alt="" width={24} height={24} className="object-contain opacity-90" />
                <span className="text-xs font-bold text-white hidden md:block">Apexotel</span>
              </div>
              {['Live Roster', 'Employees', 'Tasks', 'Logs', 'Timecards'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2.5 px-2 md:px-3 py-2 rounded-lg cursor-default ${i === 0 ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
                  <div className={`w-4 h-4 rounded-sm shrink-0 ${i === 0 ? 'bg-white/20' : 'bg-slate-700'}`}></div>
                  <span className="text-xs font-medium hidden md:block">{item}</span>
                </div>
              ))}
            </div>
            {/* Main area */}
            <div className="flex-1 p-5 md:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 w-36 bg-slate-200 rounded-md mb-1.5"></div>
                  <div className="h-3.5 w-24 bg-slate-100 rounded"></div>
                </div>
                <div className="h-8 w-28 bg-slate-900 rounded-lg"></div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Clocked In', val: '8', color: 'bg-emerald-50 border-emerald-100' },
                  { label: 'Tasks Today', val: '14', color: 'bg-blue-50 border-blue-100' },
                  { label: 'Pending Logs', val: '3', color: 'bg-amber-50 border-amber-100' },
                  { label: 'Timecards', val: '2', color: 'bg-purple-50 border-purple-100' },
                ].map(s => (
                  <div key={s.label} className={`border rounded-xl p-3 md:p-4 ${s.color}`}>
                    <div className="text-xl md:text-2xl font-bold text-slate-900">{s.val}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Employee list */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                {['Warren J. — Clocked in 09:02 AM', 'Maria C. — Clocked in 08:55 AM', 'James T. — Not yet clocked in'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${i < 2 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                    <div className={`text-xs ${i < 2 ? 'text-slate-700' : 'text-slate-400'}`}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 pb-24 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Everything your team needs</h2>
          <p className="text-slate-500 text-sm mt-2">Built to replace scattered spreadsheets and manual timesheets.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '⏱', title: 'Live Time Tracking', desc: 'Employees clock in and out with one tap. Bosses see a live roster in real-time.' },
            { icon: '✅', title: 'Task Management', desc: 'Assign tasks with priority levels. Track progress across your entire team.' },
            { icon: '📋', title: 'Timecard Approval', desc: 'Review daily logs and approve weekly timecards with payroll-ready CSV exports.' },
          ].map(f => (
            <div key={f.title} className="bg-slate-50 border border-slate-100 rounded-2xl p-7 hover:shadow-md hover:border-slate-200 transition-all duration-200">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 md:px-16 pb-24 max-w-5xl mx-auto w-full">
        <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-center">
          <Image src="/apexotel.png" alt="Apexotel" width={48} height={48} className="object-contain mx-auto mb-5 brightness-0 invert opacity-80" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Ready to get started?</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">Set up your workspace in under 2 minutes. Invite your team and start tracking immediately.</p>
          <Link href="/auth/register"
            className="inline-block bg-white text-slate-900 font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-slate-100 transition-all shadow-lg">
            Create Free Workspace →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Image src="/apexotel.png" alt="Apexotel" width={16} height={16} className="object-contain opacity-30" />
          <p className="text-xs text-slate-400">© 2026 Apexotel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
