'use client'

import { useEffect, useState } from 'react'

type AuditLog = { id: string; actor_email: string | null; action: string; target_type: string; target_label: string | null; metadata: Record<string, unknown>; created_at: string }

export function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/dashboard/audit-logs?search=${encodeURIComponent(search)}`, { signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Failed to load logs'); return data })
      .then((data) => setLogs(data.logs || []))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [search])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Security</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Audit logs</h1><p className="mt-2 text-sm text-slate-600">Review administrative changes across users and payment links.</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><label htmlFor="audit-search" className="sr-only">Search audit logs</label><input id="audit-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search actor, action, or target" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-600" /></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{error && <p className="p-4 text-sm text-red-700">{error}</p>}{loading ? <p className="p-6 text-sm text-slate-500">Loading audit logs...</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map((log) => <tr key={log.id}><td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(log.created_at).toLocaleString()}</td><td className="px-4 py-3 text-slate-700">{log.actor_email || 'System'}</td><td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{log.action}</td><td className="px-4 py-3 text-slate-700">{log.target_label || log.target_type}</td><td className="max-w-sm px-4 py-3 text-xs text-slate-500"><pre className="whitespace-pre-wrap font-sans">{JSON.stringify(log.metadata)}</pre></td></tr>)}{logs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No audit events found.</td></tr>}</tbody></table></div>}</div>
      </div>
    </main>
  )
}
