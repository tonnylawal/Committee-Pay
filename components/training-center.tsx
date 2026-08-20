'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, ExternalLink, Search, ShieldCheck } from 'lucide-react'

type Lesson = { id: string; category: string; title: string; summary: string; steps: string[]; href?: string }

const lessons: Lesson[] = [
  { id: 'start', category: 'Start here', title: 'How the admin dashboard works', summary: 'Your control center for payments, users, and operational safeguards.', steps: ['Use the sidebar to move between dashboard areas.', 'All admin pages require an active admin account.', 'Use Audit Logs to review sensitive changes and Security for protective actions.'], href: '/dashboard' },
  { id: 'links', category: 'Payments', title: 'Create and manage payment links', summary: 'Generate a link, share it with a customer, and monitor its activity.', steps: ['Open Payment Links and create a link with the amount or amount type.', 'Copy the public URL and share it with the customer.', 'Disable a link when it should no longer accept payments.'], href: '/dashboard/payment-links' },
  { id: 'transactions', category: 'Payments', title: 'Understand transactions', summary: 'Find a payment by reference and inspect its status.', steps: ['Open Transactions and search by reference or customer details.', 'Completed means the payment was verified successfully.', 'Pending payments can be checked again through reconciliation.'], href: '/dashboard/transactions' },
  { id: 'analytics', category: 'Payments', title: 'Read dashboard analytics', summary: 'Use trends and status breakdowns to understand payment performance.', steps: ['Choose a date range from 7 to 365 days.', 'Compare completed revenue with total payment attempts.', 'Use the status chart to spot failed or pending activity.'], href: '/dashboard' },
  { id: 'users', category: 'Administration', title: 'Manage users safely', summary: 'Update roles, ban accounts, and help users recover access.', steps: ['Use Users to change roles or ban and unban accounts.', 'Send a password reset or verification email when needed.', 'The primary admin info@iicar.org cannot be removed, banned, or edited.'], href: '/dashboard/users' },
  { id: 'audit', category: 'Administration', title: 'Review audit logs', summary: 'See who performed sensitive administrative actions and when.', steps: ['Filter by action, actor, or target.', 'Use metadata to understand what changed without exposing secrets.', 'Investigate unexpected changes before taking corrective action.'], href: '/dashboard/audit-logs' },
  { id: 'security', category: 'Administration', title: 'Use security controls', summary: 'Protect administrator sessions and reconcile pending payments.', steps: ['Revoke other sessions after a suspected account compromise.', 'Reconcile pending payments to compare local state with Paystack.', 'Never share passwords, API secrets, or service-role credentials.'], href: '/dashboard/security' },
  { id: 'support', category: 'Operations', title: 'Help a customer', summary: 'Search customer records and review their payment history.', steps: ['Search by email, name, or payment reference.', 'Review payment references, amounts, and statuses.', 'Use the payment reference when escalating an issue to Paystack.'], href: '/dashboard/support' },
]

export default function TrainingCenter() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState('start')
  const [completed, setCompleted] = useState<string[]>([])
  const filtered = useMemo(() => lessons.filter((lesson) => `${lesson.title} ${lesson.summary} ${lesson.category}`.toLowerCase().includes(query.toLowerCase())), [query])
  const categories = [...new Set(filtered.map((lesson) => lesson.category))]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300"><ShieldCheck className="size-4" /> Admin training center</div>
              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Learn the system by doing.</h1>
              <p className="leading-6 text-slate-300">Short, practical lessons for running payments, supporting customers, and keeping the platform secure.</p>
            </div>
            <div className="min-w-48 rounded-xl bg-white/10 p-4"><div className="text-2xl font-bold">{completed.length}/{lessons.length}</div><div className="text-sm text-slate-300">lessons completed</div></div>
          </div>
        </header>
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search training topics" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none ring-cyan-500 focus:ring-2" aria-label="Search training topics" /></div>
        <div className="space-y-6">
          {categories.map((category) => <section key={category} className="space-y-3"><h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">{category}</h2><div className="space-y-3">{filtered.filter((lesson) => lesson.category === category).map((lesson) => { const isOpen = open === lesson.id; const isDone = completed.includes(lesson.id); return <article key={lesson.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><button type="button" onClick={() => setOpen(isOpen ? '' : lesson.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left"><span className="flex items-start gap-3"><CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${isDone ? 'text-emerald-600' : 'text-slate-300'}`} /><span><span className="block font-semibold">{lesson.title}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{lesson.summary}</span></span></span><ChevronDown className={`size-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4"><ol className="space-y-3">{lesson.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700">{index + 1}</span>{step}</li>)}</ol><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setCompleted((current) => isDone ? current.filter((id) => id !== lesson.id) : [...current, lesson.id])} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{isDone ? 'Mark incomplete' : 'Mark complete'}</button>{lesson.href && <Link href={lesson.href} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Open this area <ExternalLink className="size-4" /></Link>}</div></div>}</article> })}</div></section>)}
          {filtered.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No training topics match your search.</div>}
        </div>
      </div>
    </main>
  )
}
