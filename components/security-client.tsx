'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SecurityClient({ email }: { email: string }) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [reconciling, setReconciling] = useState(false)

  const reconcilePayments = async () => {
    setReconciling(true)
    setStatus('')
    const response = await fetch('/api/dashboard/payments/reconcile', { method: 'POST' })
    const data = await response.json().catch(() => ({}))
    setStatus(response.ok ? `Checked ${data.checked} pending payments; updated ${data.updated}.` : data.error || 'Reconciliation failed.')
    setReconciling(false)
  }

  const revokeOtherSessions = async () => {
    setBusy(true)
    setStatus('')
    const { error } = await createClient().auth.signOut({ scope: 'others' })
    setStatus(error ? error.message : 'All other sessions have been revoked.')
    setBusy(false)
  }

  return (
    <section className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-8"><h1 className="text-2xl font-bold text-slate-900">Security</h1><p className="mt-1 text-slate-600">Review this admin account and revoke sessions on other devices.</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Signed in as</p><p className="mt-1 font-semibold text-slate-900">{email}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4"><button onClick={revokeOtherSessions} disabled={busy} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{busy ? 'Revoking...' : 'Revoke other sessions'}</button><button onClick={reconcilePayments} disabled={reconciling} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{reconciling ? 'Checking payments...' : 'Reconcile pending payments'}</button>{status && <p className="text-sm text-slate-600" role="status">{status}</p>}</div>
      </div>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">If you suspect unauthorized access, revoke other sessions immediately and change the account password.</div>
    </section>
  )
}
