'use client'

import { resetAndCreateAdminUser } from '@/app/actions/seed-admin'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetAdminPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async () => {
    setLoading(true)
    setStatus('Deleting old user and creating fresh admin user...')
    
    try {
      const result = await resetAndCreateAdminUser()
      setStatus(result.message)
      
      if (result.success) {
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
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Reset Admin User</h1>
          <p className="text-center text-slate-600 mb-8">This will delete the existing admin user and create a fresh one with correct password hashing.</p>
          
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset Admin User'}
          </button>

          {status && (
            <div className={`mt-4 p-4 rounded-lg text-center text-sm ${
              status.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-xs">
              Admin credentials after reset:<br/>
              Email: info@iicar.org<br/>
              Password: @IICAR1016!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
