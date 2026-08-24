'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface DashboardHeaderProps {
  user: {
    id: string
    email: string
    user_metadata?: {
      name?: string
    }
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 sm:pb-6 gap-4 sm:gap-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AI4NpeWalkY7W71u1pkZBkccI4LRDE.png" alt="Committee" width={60} height={60} className="h-10 sm:h-14 w-auto" />
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Payment Links Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-600">Manage your payment links and transactions</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-slate-600">Signed in as</p>
          <p className="text-sm sm:font-semibold font-medium text-slate-900 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="px-3 sm:px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-900 font-medium text-sm rounded-lg transition"
        >
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
