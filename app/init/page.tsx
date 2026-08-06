'use client'

import { seedAdminUser } from '@/app/actions/seed-admin'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InitPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSeed = async () => {
    setLoading(true)
    try {
      const result = await seedAdminUser()
      setStatus(result.message)
      
      if (result.success) {
        // Redirect to sign-in after successful creation
        setTimeout(() => {
          router.push('/sign-in')
        }, 2000)
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Initialize Admin User</h1>
        <p className="text-slate-600 mb-6">Click the button below to create the admin user (info@iicar.org)</p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition mb-4"
        >
          {loading ? 'Creating...' : 'Create Admin User'}
        </button>

        {status && <div className={`p-3 rounded-lg text-sm ${status.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{status}</div>}
      </div>
    </main>
  )
}
