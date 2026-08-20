'use client'

import { FormEvent, useState } from 'react'

type Result = { customers: Array<{ id: string; email: string; full_name: string | null; role: string; is_active: boolean }>; payments: Array<{ id: string; reference: string; email: string; amount_usd: string; amount_kes: string; currency: string; status: string; transaction_id: string | null; created_at: string }> }

export default function SupportWorkspace() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<Result>({ customers: [], payments: [] })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function search(event: FormEvent) {
    event.preventDefault()
    if (query.trim().length < 2) return setMessage('Enter at least two characters, an email, or a payment reference.')
    setLoading(true); setMessage('')
    const response = await fetch(`/api/dashboard/support?q=${encodeURIComponent(query.trim())}`)
    const data = await response.json()
    setResult(data); setLoading(false)
    if (!response.ok) setMessage(data.error || 'Search failed')
    if (data.customers.length === 0 && data.payments.length === 0) setMessage('No matching customers or payments found.')
  }

  return <div className="p-4 sm:p-6 md:p-8"><div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Operations</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Customer support</h1><p className="mt-2 text-slate-600">Find a customer, inspect payment history, and resolve payment questions quickly.</p></header>
    <form onSubmit={search} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label htmlFor="support-search" className="sr-only">Search customer or payment reference</label><input id="support-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Email, customer name, or payment reference" className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-slate-500"/><button disabled={loading} className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-60">{loading ? 'Searching...' : 'Search records'}</button></form>
    {message && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p>}
    <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Customers</h2><div className="mt-4 space-y-3">{result.customers.map((customer) => <div key={customer.id} className="rounded-lg bg-slate-50 p-3"><p className="font-medium text-slate-900">{customer.full_name || 'Unnamed customer'}</p><p className="text-sm text-slate-600">{customer.email}</p><p className="mt-1 text-xs text-slate-500">{customer.role} · {customer.is_active ? 'Active' : 'Banned'}</p></div>)}{result.customers.length === 0 && <p className="text-sm text-slate-500">Search results will appear here.</p>}</div></div>
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Payment history</h2><span className="text-sm text-slate-500">{result.payments.length} records</span></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr><th className="py-3 pr-4">Reference</th><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Amount</th><th className="py-3 pr-4">Status</th><th className="py-3">Date</th></tr></thead><tbody className="divide-y">{result.payments.map((payment) => <tr key={payment.id}><td className="py-3 pr-4 font-mono text-xs text-slate-700">{payment.reference}</td><td className="py-3 pr-4 text-slate-600">{payment.email}</td><td className="py-3 pr-4 font-medium text-slate-900">{payment.currency} {payment.amount_kes}</td><td className="py-3 pr-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{payment.status}</span></td><td className="py-3 text-slate-500">{new Date(payment.created_at).toLocaleString()}</td></tr>)}</tbody></table>{result.payments.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Search by payment reference or email to view history.</p>}</div></div></section>
  </div></div>
}
