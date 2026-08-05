'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { authClient } from '@/lib/auth-client'

interface DashboardHeaderProps {
  user: {
    id: string
    email: string
    name?: string
    image?: string
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/')
            router.refresh()
          },
        },
      })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="Alghahim Pay" width={60} height={60} className="h-14 w-auto" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Links Dashboard</h1>
          <p className="text-sm text-slate-600">Manage your payment links and transactions</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-slate-600">Signed in as</p>
          <p className="font-semibold text-slate-900">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-900 font-medium rounded-lg transition"
        >
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
