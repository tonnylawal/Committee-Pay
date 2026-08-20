'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      if (mode === 'sign-in') {
        const checkResponse = await fetch('/api/auth/sign-in-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
        if (!checkResponse.ok) {
          const checkData = await checkResponse.json().catch(() => ({}))
          setError(checkData.error || 'Too many sign-in attempts. Please try again later.')
          return
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          void fetch('/api/auth/sign-in-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, result: 'failure', reason: signInError.message }) })
          setError(signInError.message || 'Sign in failed')
        } else {
          void fetch('/api/auth/sign-in-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, result: 'success' }) })
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name: email.split('@')[0],
            },
          },
        })

        if (signUpError) {
          setError(signUpError.message || 'Sign up failed')
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {loading ? 'Loading...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  )
}
